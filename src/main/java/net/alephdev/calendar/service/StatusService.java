package net.alephdev.calendar.service;

import net.alephdev.calendar.models.Status;
import net.alephdev.calendar.repository.StatusRepository;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StatusService {

    private final StatusRepository statusRepository;

    public List<Status> getAllStatuses() {
        return statusRepository.findAll();
    }

    public Status createStatus(Status status) {
        return statusRepository.save(status);
    }

    public Status updateStatus(Integer id, Status updatedStatus) {
        Status status = statusRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Status not found"));

        status.setName(updatedStatus.getName());
        status.setDescription(updatedStatus.getDescription());

        return statusRepository.save(status);
    }

    public void deleteStatus(Integer id) {
        if(id <= 1) {
            throw new IllegalArgumentException("Cannot delete default status");
        }
        statusRepository.deleteById(id);
    }

    public Status getStatus(Integer statusId) {
        return statusRepository.findById(statusId)
                .orElseThrow(() -> new IllegalArgumentException("Status not found"));
    }
}