import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild} from "@angular/core";
import {DatePipe} from "@angular/common";
import {FullCalendarComponent, FullCalendarModule} from '@fullcalendar/angular';
import {CalendarOptions} from '@fullcalendar/core';
import multiMonthPlugin from '@fullcalendar/multimonth'
import moment from "moment";
import {AlertService} from "../../services/alert.service";
import {SprintTeamDto} from "../../models/dto/sprint-team-dto";
import {SprintService} from "../../services/server/sprint.service";
import {CalendarService} from "../../services/server/calendar.service";
import {Day} from "../../models/misc/day";
import {MessageDto} from "../../models/dto/message-dto";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-sprints-calendar',
  standalone: true,
  imports: [DatePipe, FullCalendarModule],
  templateUrl: './sprints-calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SprintsCalendarComponent implements AfterViewInit, OnInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  calendarOptions : CalendarOptions = {
    initialView: 'multiMonthYear',
    plugins: [multiMonthPlugin],
    locale: 'ru',
    firstDay: 1,
    weekends: true,
    events: [],
    multiMonthMaxColumns: 2,
    buttonText: {
      today: moment().format('DD.MM.YYYY')
    },
    datesSet: this.update.bind(this),
    moreLinkText: 'больше'
  };
  sprints : SprintTeamDto[] = [];
  dayOffs : Day[] = [];
  constructor(private sprintService : SprintService,
              private alertService: AlertService,
              private calendarService: CalendarService,
              private cdRef: ChangeDetectorRef) {
    this.sprintService.sprint$.subscribe(this.updateSprints.bind(this));
  }
  updateSprints() {
    this.sprintService.getSprintsByYearAndTeam(this.getYear(), "API").subscribe(sprints => {
      if(sprints as SprintTeamDto[]) {
        this.sprints = sprints as SprintTeamDto[];
        if(this.calendarComponent?.getApi()) {
          this.calendarComponent.getApi().refetchEvents();
        }
        this.cdRef.markForCheck();
      } else {
        this.alertService.showAlert("danger", "Не удалось получить информацию о спринтах");
        console.error(sprints as HttpErrorResponse);
      }
    })
  }
  getYear() {
    let year = new Date().getFullYear();
    if(this.calendarComponent?.getApi()) {
      year = this.calendarComponent.getApi().getDate().getFullYear();
    }
    return year;
  }
  updateDayOffs() {
    this.calendarService.getCalendar(this.getYear()).subscribe(async message => {
      if(message as MessageDto) {
        localStorage.setItem(`calendar${this.getYear()}`, JSON.stringify(message as MessageDto));
        this.dayOffs = await this.parseCalendar(this.getYear(), (message as MessageDto).message);
        if(this.calendarComponent?.getApi()) {
          this.calendarComponent.getApi().refetchEvents();
        }
        this.cdRef.markForCheck();
      } else {
        this.alertService.showAlert("danger", "Не удалось получить информацию о выходных днях");
        console.error(message as HttpErrorResponse);
      }
    });
  }
  dayOffEvents(_: any, success: any) {
    let events = [];
    for (let day of this.dayOffs) {
      events.push({
        title: '',
        date: moment(day.date).format('YYYY-MM-DD'),
        backgroundColor: day.full ? 'red' : 'orange',
        display: 'background'
      })
    }
    success(events);
  }
  sprintsEvents(_: any, success: any) {
    let events = [];
    for(let sprint of this.sprints) {
      events.push({
        title: sprint.majorVersion,
        start: moment(sprint.startDate).toDate(),
        end: moment(sprint.endDate).add(1, 'days').toDate(),
        display: 'block',
        backgroundColor: sprint.teamColor,
        allDay: true
      })
    }
    success(events);
  }
  ngAfterViewInit() {
    if(this.calendarComponent.getApi()) {
      this.calendarComponent.getApi().addEventSource(this.dayOffEvents.bind(this));
      this.calendarComponent.getApi().addEventSource(this.sprintsEvents.bind(this));
    }
    else setTimeout(() => {
      this.ngAfterViewInit.bind(this);
      this.cdRef.markForCheck();
    }, 10);
  }
  update() {
    this.updateSprints();
    this.updateDayOffs();
  }
  ngOnInit() {
    this.update();
  }

  private async parseCalendar(year: number, data: string | null): Promise<Day[]> {
    return new Promise((resolve, eject) => {
      try {
        let result : Day[] = [];
        let currentDate = moment(`${year}-01-01`, 'YYYY-MM-DD');
        for(let i of data as string) {
          if(i == '1' || i == '2') {
            result.push(new Day(currentDate.toDate(), i == '1'));
          }
          currentDate = currentDate.add(1, 'day');
        }
        resolve(result);
      } catch (e) {
        eject(e);
      }
    });
  }
}
