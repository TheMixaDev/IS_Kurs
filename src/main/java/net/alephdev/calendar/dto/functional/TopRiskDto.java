package net.alephdev.calendar.dto.functional;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TopRiskDto {
    private final Integer riskId; 
    private final String description;
    private final BigDecimal totalEstimatedLoss;
}