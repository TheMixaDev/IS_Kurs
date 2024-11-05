package net.alephdev.calendar.controller;

import lombok.RequiredArgsConstructor;
import net.alephdev.calendar.annotation.AuthorizedRequired;
import net.alephdev.calendar.annotation.PrivilegeRequired;
import net.alephdev.calendar.dto.ReleaseDto;
import net.alephdev.calendar.models.Release;
import net.alephdev.calendar.service.ReleaseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/releases")
@AuthorizedRequired
@RequiredArgsConstructor
public class ReleaseController {

    private final ReleaseService releaseService;

    @GetMapping
    public List<Release> getAllReleases() {
        return releaseService.getAllReleases();
    }

    @PrivilegeRequired
    @PostMapping
    public ResponseEntity<Release> createRelease(@RequestBody ReleaseDto releaseDto) {
        Release createdRelease = releaseService.createRelease(releaseDto);
        return new ResponseEntity<>(createdRelease, HttpStatus.CREATED);
    }

    @PrivilegeRequired
    @PutMapping("/{id}")
    public ResponseEntity<Release> updateRelease(@PathVariable Integer id, @RequestBody ReleaseDto updatedRelease) {
        Release release = releaseService.updateRelease(id, updatedRelease);
        return new ResponseEntity<>(release, HttpStatus.OK);
    }

    @PrivilegeRequired
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRelease(@PathVariable Integer id) {
        releaseService.deleteRelease(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}