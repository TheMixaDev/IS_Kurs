package net.alephdev.calendar.models;

import jakarta.persistence.*;
import lombok.Data;
import net.alephdev.calendar.models.keys.IdeaRiskId;

@Data
@Entity
@IdClass(IdeaRiskId.class)
public class IdeaRisk {
    @Id
    @ManyToOne
    @JoinColumn(name = "idea_id", foreignKey = @ForeignKey(name = "fk_idea_risk_idea_id"))
    private Idea idea;

    @Id
    @ManyToOne
    @JoinColumn(name = "risk_id", foreignKey = @ForeignKey(name = "fk_idea_risk_risk_id"))
    private Risk risk;
}
