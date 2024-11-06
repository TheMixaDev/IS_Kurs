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
import org.springframework.stereotype.Service;

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
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found"));

        if(releaseDto.getReleaseDate() == null ||
                releaseDto.getReleaseDate().isBefore(sprint.getStartDate()) ||
                releaseDto.getReleaseDate().isAfter(sprint.getEndDate())) {
            throw new IllegalArgumentException("Release date must be between sprint dates");
        }
        release.setVersion(releaseDto.getVersion());
        release.setReleaseDate(releaseDto.getReleaseDate());
        release.setDescription(releaseDto.getDescription());
        release.setSprint(sprint);
        return releaseRepository.save(release);
    }

    public Release updateRelease(Integer id, ReleaseDto updatedRelease) {
        Release release = releaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Release not found"));

        if (updatedRelease.getSprintId() != null) {
            Sprint sprint = sprintRepository.findById(updatedRelease.getSprintId())
                    .orElseThrow(() -> new IllegalArgumentException("Sprint not found"));
            release.setSprint(sprint);
        }

        if(updatedRelease.getReleaseDate() == null ||
                updatedRelease.getReleaseDate().isBefore(release.getSprint().getStartDate()) ||
                updatedRelease.getReleaseDate().isAfter(release.getSprint().getEndDate())) {
            throw new IllegalArgumentException("Release date must be between sprint dates");
        }
        release.setVersion(updatedRelease.getVersion());
        release.setReleaseDate(updatedRelease.getReleaseDate());
        release.setDescription(updatedRelease.getDescription());

        return releaseRepository.save(release);
    }

    public void deleteRelease(Integer id) {
        releaseRepository.deleteById(id);
    }
}