package net.alephdev.calendar.controller;

import lombok.RequiredArgsConstructor;
import net.alephdev.calendar.annotation.AuthorizedRequired;
import net.alephdev.calendar.annotation.PrivilegeRequired;
import net.alephdev.calendar.dto.MessageDto;
import net.alephdev.calendar.dto.ReleaseDto;
import net.alephdev.calendar.models.Release;
import net.alephdev.calendar.service.ReleaseService;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/releases")
@AuthorizedRequired
@RequiredArgsConstructor
public class ReleaseController {

    private final ReleaseService releaseService;

    @GetMapping
    public Page<Release> getAllReleases(@RequestParam @DefaultValue("0") int page) {
        return releaseService.getAllReleases(page);
    }

    @GetMapping("/sprint/{sprintId}")
    public Page<Release> getAllReleasesBySprint(@PathVariable Integer sprintId, @RequestParam @DefaultValue("0") int page) {
        return releaseService.getAllReleasesBySprint(sprintId, page);
    }

    @PrivilegeRequired
    @PostMapping
    public ResponseEntity<?> createRelease(@RequestBody ReleaseDto releaseDto) {
        try {
            Release createdRelease = releaseService.createRelease(releaseDto);
            return new ResponseEntity<>(createdRelease, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new MessageDto(e.getMessage()),HttpStatus.BAD_REQUEST);
        }
    }

    @PrivilegeRequired
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRelease(@PathVariable Integer id, @RequestBody ReleaseDto updatedRelease) {
        try {
            Release release = releaseService.updateRelease(id, updatedRelease);
            return new ResponseEntity<>(release, HttpStatus.OK);
        }
        catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new MessageDto(e.getMessage()),HttpStatus.BAD_REQUEST);
        }
    }

    @PrivilegeRequired
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRelease(@PathVariable Integer id) {
        releaseService.deleteRelease(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}