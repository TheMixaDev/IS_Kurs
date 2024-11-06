package net.alephdev.calendar.controller;

import lombok.RequiredArgsConstructor;
import net.alephdev.calendar.annotation.AuthorizedRequired;
import net.alephdev.calendar.dto.MessageDto;
import net.alephdev.calendar.interfaces.CalendarServiceInterface;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/calendar")
@Cacheable("calendarData")
public class CalendarController {
    private final CalendarServiceInterface calendarService;

    @GetMapping
    @AuthorizedRequired
    public ResponseEntity<MessageDto> getCalendar(
            @RequestParam int year
    ) {
        try {
            String response = calendarService.getDayOffData(year);
            return ResponseEntity.ok(new MessageDto(response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageDto("Unable to get calendar information"));
        }
    }

}
