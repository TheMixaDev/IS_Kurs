package net.alephdev.calendar.service;

import lombok.RequiredArgsConstructor;
import net.alephdev.calendar.dto.ReleaseDto;
import net.alephdev.calendar.models.Release;
import net.alephdev.calendar.models.Sprint;
import net.alephdev.calendar.repository.ReleaseRepository;
import net.alephdev.calendar.repository.functional.SprintRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReleaseService {

    private final ReleaseRepository releaseRepository;
    private final SprintRepository sprintRepository;

    public List<Release> getAllReleases() {
        return releaseRepository.findAll();
    }

    public Release createRelease(ReleaseDto releaseDto) {
        Release release = new Release();
        Sprint sprint = sprintRepository.findById(releaseDto.getSprintId())
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found"));

        release.setVersion(releaseDto.getVersion());
        release.setReleaseDate(releaseDto.getReleaseDate());
        release.setDescription(releaseDto.getDescription());
        release.setSprint(sprint);
        return releaseRepository.save(release);
    }

    public Release updateRelease(Integer id, ReleaseDto updatedRelease) {
        Release release = releaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Release not found"));

        release.setVersion(updatedRelease.getVersion());
        release.setReleaseDate(updatedRelease.getReleaseDate());
        release.setDescription(updatedRelease.getDescription());
        if (updatedRelease.getSprintId() != null) {
            Sprint sprint = sprintRepository.findById(updatedRelease.getSprintId())
                    .orElseThrow(() -> new IllegalArgumentException("Sprint not found"));
            release.setSprint(sprint);
        }

        return releaseRepository.save(release);
    }

    public void deleteRelease(Integer id) {
        releaseRepository.deleteById(id);
    }
}