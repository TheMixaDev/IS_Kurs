package net.alephdev.calendar.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import net.alephdev.calendar.dto.functional.TopRiskDto;
import net.alephdev.calendar.repository.functional.RiskRepository;

@Service
@RequiredArgsConstructor
public class RiskService {
    private final RiskRepository riskRepository;

    public List<TopRiskDto> getTop10TaskRisks() {
        List<Object[]> results = riskRepository.getTop10TaskRisks();
        
        return results.stream()
            .map(row -> new TopRiskDto(
                row[0] instanceof Number ? ((Number) row[0]).intValue() : null,  // risk_id as Integer
                (String) row[1],                                                 // description
                (BigDecimal) row[2]                                             // total_estimated_loss
            ))
            .collect(Collectors.toList());
    }
}
