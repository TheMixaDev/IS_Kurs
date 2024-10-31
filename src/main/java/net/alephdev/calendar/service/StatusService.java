package net.alephdev.calendar.service;

import net.alephdev.calendar.models.Status;
import net.alephdev.calendar.repository.StatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StatusService {

    private final StatusRepository statusRepository;

    @Autowired
    public StatusService(StatusRepository statusRepository) {
        this.statusRepository = statusRepository;
    }

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
        statusRepository.deleteById(id);
    }
}