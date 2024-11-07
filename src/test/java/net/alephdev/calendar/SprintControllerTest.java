package net.alephdev.calendar;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import com.jayway.jsonpath.JsonPath;

import jakarta.transaction.Transactional;
import net.alephdev.calendar.repository.functional.TeamRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class SprintControllerTest extends BaseIntegrationTest{
    private String jwtToken;

    @Autowired
    private TeamRepository teamRepository;
    
    @BeforeEach
    void setUp() throws Exception {
        this.jwtToken = getJwtToken("ernst_ignatukev", "1234567");
    }

    @Test
    @DisplayName("F1 - ok")
    void crudSprints() throws Exception {
        String requestJson = """
            {
                "majorVersion": "sprint_version",
                "startDate": "2024-01-05",
                "endDate": "2024-01-15",
                "regressionStart": "2024-01-12",
                "regressionEnd": "2024-01-14",
                "teamId": 1
            }""";
        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.post("/api/sprints")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .header("Authorization", "Bearer " + jwtToken))
            .andExpect(MockMvcResultMatchers.status().is(201)).andReturn();

        String responseJson = result.getResponse().getContentAsString();
        Integer sprintId = JsonPath.read(responseJson, "$.id");

        mockMvc.perform(MockMvcRequestBuilders.get("/api/sprints/filtered")
            .param("year", "2024")
            .param("teamName", teamRepository.findById(1).get().getName().toString())
            .header("Authorization", "Bearer " + jwtToken))
            .andExpect(MockMvcResultMatchers.status().isOk())
            .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].majorVersion").value("sprint_version"))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].startDate").value("2024-01-05"))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].endDate").value("2024-01-15"));

        String requestJsonUpdate = """
            {
                "majorVersion": "sprint_version_1",
                "startDate": "2024-01-16",
                "endDate": "2024-01-25",
                "regressionStart": "2024-01-16",
                "regressionEnd": "2024-01-25",
                "teamId": 1
            }""";
        mockMvc.perform(MockMvcRequestBuilders.put("/api/sprints/{id}", sprintId)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJsonUpdate)
            .header("Authorization", "Bearer " + jwtToken))
            .andExpect(MockMvcResultMatchers.status().isOk());

        mockMvc.perform(MockMvcRequestBuilders.get("/api/sprints/filtered")
            .param("year", "2024")
            .param("teamName", teamRepository.findById(1).get().getName())
            .header("Authorization", "Bearer " + jwtToken))
            .andExpect(MockMvcResultMatchers.status().is(200))
            .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].majorVersion").value("sprint_version_1"))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].startDate").value("2024-01-16"))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].endDate").value("2024-01-25"));

    }
}
