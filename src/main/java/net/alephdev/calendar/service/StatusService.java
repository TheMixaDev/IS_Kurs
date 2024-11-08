package net.alephdev.calendar.service;

import net.alephdev.calendar.models.Status;
import net.alephdev.calendar.repository.StatusRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class StatusService {

    private final StatusRepository statusRepository;

    public List<Status> getAllStatuses() {
        return statusRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public Status createStatus(Status status) {
        return statusRepository.save(status);
    }

    public Status updateStatus(Integer id, Status updatedStatus) {
        Status status = statusRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Status not found"));

        status.setName(updatedStatus.getName());
        status.setDescription(updatedStatus.getDescription());

        return statusRepository.save(status);
    }

    public ResponseEntity<Void> deleteStatus(Integer id) {
        if(id <= 1) {
            throw new IllegalArgumentException("Cannot delete default status");
        }
        if (statusRepository.findById(id).isPresent()) {
            statusRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
        
    }

    public Status getStatus(Integer statusId) {
        return statusRepository.findById(statusId)
                .orElseThrow(() -> new NoSuchElementException("Status not found"));
    }
}