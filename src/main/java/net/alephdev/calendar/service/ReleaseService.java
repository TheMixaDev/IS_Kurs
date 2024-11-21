package net.alephdev.calendar.service;

import lombok.RequiredArgsConstructor;
import net.alephdev.calendar.dto.ReleaseDto;
import net.alephdev.calendar.models.Release;
import net.alephdev.calendar.models.Sprint;
import net.alephdev.calendar.repository.ReleaseRepository;
import net.alephdev.calendar.repository.functional.SprintRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ReleaseService {

    private final ReleaseRepository releaseRepository;
    private final SprintRepository sprintRepository;

    public Page<Release> getAllReleases(int page) {
        return releaseRepository.findAll(PageRequest.of(page, 20, Sort.by(Sort.Direction.ASC, "releaseDate")));
    }

    public Page<Release> getAllReleasesBySprint(Integer sprintId, int page) {
        return releaseRepository.findAllBySprint_Id(sprintId, PageRequest.of(page, 20, Sort.by(Sort.Direction.ASC, "releaseDate")));
    }

    public Release createRelease(ReleaseDto releaseDto) {
        Release release = new Release();
        Sprint sprint = sprintRepository.findById(releaseDto.getSprintId())
                .orElseThrow(() -> new NoSuchElementException("Спринт не найден"));

        release.setVersion(releaseDto.getVersion().trim());
        release.setReleaseDate(releaseDto.getReleaseDate());
        if(releaseDto.getDescription() != null)
            release.setDescription(releaseDto.getDescription().trim());
        release.setSprint(sprint);
        return releaseRepository.save(release);
    }

    public Release updateRelease(Integer id, ReleaseDto updatedRelease) {
        Release release = releaseRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Релиз не найден"));

        if (updatedRelease.getSprintId() != null) {
            Sprint sprint = sprintRepository.findById(updatedRelease.getSprintId())
                    .orElseThrow(() -> new NoSuchElementException("Спринт не найден"));
            release.setSprint(sprint);
        }

        release.setVersion(updatedRelease.getVersion().trim());
        release.setReleaseDate(updatedRelease.getReleaseDate());
        if(updatedRelease.getDescription() != null)
            release.setDescription(updatedRelease.getDescription().trim());

        return releaseRepository.save(release);
    }

    public ResponseEntity<Void> deleteRelease(Integer id) {
        if (releaseRepository.findById(id).isPresent()) {
            releaseRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}