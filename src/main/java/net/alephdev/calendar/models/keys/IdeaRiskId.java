package net.alephdev.calendar.models.keys;

import lombok.Data;

import java.io.Serializable;

@Data
public class IdeaRiskId implements Serializable {
    private Integer idea;
    private Integer risk;
}
