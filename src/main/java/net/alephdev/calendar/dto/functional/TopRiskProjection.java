package net.alephdev.calendar.dto.functional;

import java.math.BigDecimal;

public interface TopRiskProjection {
    Integer getRiskId();
    String getDescription();
    BigDecimal getTotalEstimatedLoss();
}
