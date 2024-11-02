package net.alephdev.calendar.dto.funcDto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopRiskDto {
    private Integer riskId; 
    private String description;
    private BigDecimal totalEstimatedLoss;
}