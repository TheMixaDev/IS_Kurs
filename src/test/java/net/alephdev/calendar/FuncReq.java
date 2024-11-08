package net.alephdev.calendar;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.hamcrest.Matchers.*;


import com.jayway.jsonpath.JsonPath;

import jakarta.transaction.Transactional;
import net.alephdev.calendar.repository.functional.TeamRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class FuncReq extends BaseIntegrationTest{
    private String jwtToken;

    @Autowired
    private TeamRepository teamRepository;
    
    @BeforeEach
    void setUp() throws Exception {
        this.jwtToken = getJwtToken("ernst_ignatukev", "1234567");
    }

    @Test
    @DisplayName("F1 | F11 | F12 - F14")
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

    @Test
    @DisplayName("F2")
    void upSprints() throws Exception {
        String requestJson = """
            {
                "majorVersion": "f2",
                "startDate": "2028-01-05",
                "endDate": "2028-01-15",
                "regressionStart": "2028-01-12",
                "regressionEnd": "2028-01-14",
                "teamId": 1
            }""";
        mockMvc.perform(MockMvcRequestBuilders.post("/api/sprints")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .header("Authorization", "Bearer " + jwtToken))
            .andExpect(MockMvcResultMatchers.status().is(201)).andReturn();

        mockMvc.perform(MockMvcRequestBuilders.get("/api/sprints/filtered")
            .param("year", "2028")
            .param("teamName", teamRepository.findById(1).get().getName().toString())
            .header("Authorization", "Bearer " + jwtToken))
            .andExpect(MockMvcResultMatchers.status().isOk())
            .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].majorVersion").value("f2"))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].startDate").value("2028-01-05"))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].endDate").value("2028-01-15"));

    }

    @Test
    @DisplayName("F3 | F15 | F16")
    void crudTask() throws Exception {
        String requestJson = """
            {
                "name": "test",
                "storyPoints": 5,
                "priorityEnum": "MEDIUM"
            }""";
        MvcResult mockResult = mockMvc.perform(MockMvcRequestBuilders.post("/api/tasks")
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestJson)
            .header("Authorization", "Bearer " + jwtToken))
            .andExpect(MockMvcResultMatchers.status().is(201)).andReturn();

        String responseJson = mockResult.getResponse().getContentAsString();
        Integer taskId = JsonPath.read(responseJson, "$.id");

        mockMvc.perform(MockMvcRequestBuilders.put("/api/tasks/{id}/sprint", taskId)
            .param("sprintId", "1")
            .header("Authorization", "Bearer " + jwtToken))
            .andExpect(MockMvcResultMatchers.status().is(200));

        mockMvc.perform(MockMvcRequestBuilders.delete("/api/tasks/{id}", 4532525)
            .header("Authorization", "Bearer " + jwtToken))
            .andExpect(MockMvcResultMatchers.status().is(404));

        mockMvc.perform(MockMvcRequestBuilders.delete("/api/tasks/{id}", taskId)
            .header("Authorization", "Bearer " + jwtToken))
            .andExpect(MockMvcResultMatchers.status().is(204));

        String implementerLogin = "glafira9";

        mockMvc.perform(put("/api/tasks/{taskId}/implementer", 1)
                .param("implementerLogin", implementerLogin)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.implementer.login").value(implementerLogin));

    }

    @Test
    @DisplayName("F4-F6")
    void shouldPerformTeamCrudOperations() throws Exception {
        String createTeamJson = """
                {
                    "name": "team_name",
                    "color": "#FF0000",
                    "description": "team_description"
                }""";
                
        MvcResult createResult = mockMvc.perform(post("/api/teams")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createTeamJson)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("team_name"))
                .andReturn();

        String responseJson = createResult.getResponse().getContentAsString();
        Integer teamId = JsonPath.read(responseJson, "$.id");
        assertNotNull(teamId, "Team ID should not be null");

        String updateTeamJson = """
                {
                    "name": "team_name",
                    "color": "#FF2345",
                    "description": "team_description_1"
                }""";
                
        mockMvc.perform(put("/api/teams/{id}", teamId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateTeamJson)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.color").value("#FF2345"))
                .andExpect(jsonPath("$.description").value("team_description_1"));

        String updateTeamEmptyDescJson = """
                {
                    "name": "team_name",
                    "color": "#FF2345",
                    "description": ""
                }""";
                
        mockMvc.perform(put("/api/teams/{id}", teamId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateTeamEmptyDescJson)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value(""));

        mockMvc.perform(delete("/api/teams/{id}", 31242134)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/teams/{id}", teamId)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("F7")
    void shouldUpdateUserTeam() throws Exception {
        String login = "glafira9";
        Integer expectedTeamId = 1;

        mockMvc.perform(MockMvcRequestBuilders.put("/api/users/{login}/team", login)
                .param("teamId", expectedTeamId.toString())
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(MockMvcResultMatchers.status().isOk());

        MvcResult result = mockMvc.perform(MockMvcRequestBuilders.get("/api/users")
                .param("page", "0")
                .param("login", login)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("$.content[0].team.id").exists())
                .andReturn();

        String responseJson = result.getResponse().getContentAsString();
        Integer actualTeamId = JsonPath.read(responseJson, "$.content[0].team.id");
        
        assertNotNull(actualTeamId, "Team ID should not be null");
        assertEquals(expectedTeamId.intValue(), actualTeamId, 
            "User's team ID should be updated to " + expectedTeamId);

        mockMvc.perform(MockMvcRequestBuilders.put("/api/users/{login}/team", login)
            .param("teamId", "0")
            .header("Authorization", "Bearer " + jwtToken))
            .andExpect(MockMvcResultMatchers.status().isOk());
    }

    @Test
    @DisplayName("F8")
    void shouldUpdateUserRole() throws Exception {
        String login = "glafira9";
        Long expectedRoleId = 3L;
    
        mockMvc.perform(put("/api/users/{login}/role", login)
                .param("roleId", expectedRoleId.toString())
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());
    
        MvcResult result = mockMvc.perform(get("/api/users")
                .param("page", "0")
                .param("login", login)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].role.id").exists())
                .andExpect(jsonPath("$.content[0].role.id").value(expectedRoleId))
                .andExpect(jsonPath("$.content[0].role.name").exists())
                .andExpect(jsonPath("$.content[0].role.responsibilities").exists())
                .andReturn();
    
        String responseJson = result.getResponse().getContentAsString();
        Integer actualRoleId = JsonPath.read(responseJson, "$.content[0].role.id");
        String roleName = JsonPath.read(responseJson, "$.content[0].role.name");
        
        assertNotNull(actualRoleId, "Role ID should not be null");
        assertEquals(expectedRoleId.intValue(), actualRoleId, 
            "User's role ID should be updated to " + expectedRoleId);
        assertNotNull(roleName, "Role name should not be null");
    }

    @Test
    @DisplayName("Admin should register new user and then user should authenticate")
    void shouldRegisterByAdminAndAuthenticate() throws Exception {
        String registrationJson = """
                {
                    "login": "testuser123",
                    "password": "Password123!",
                    "email": "testuser@example.com",
                    "firstName": "Test",
                    "lastName": "User"
                }""";

        mockMvc.perform(post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registrationJson)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.login").value("testuser123"));

        String loginJson = """
                {
                    "username": "testuser123",
                    "password": "Password123!"
                }""";

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andReturn();

        String responseJson = loginResult.getResponse().getContentAsString();
        String userToken = JsonPath.read(responseJson, "$.token");
        assertNotNull(userToken, "JWT token should not be null");
    }

    @Test
    @DisplayName("Should fail registration without admin token")
    void shouldFailRegistrationWithoutAdminToken() throws Exception {
        String registrationJson = """
                {
                    "login": "testuser123",
                    "password": "Password123!",
                    "email": "testuser@example.com",
                    "firstName": "Test",
                    "lastName": "User"
                }""";

        mockMvc.perform(post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registrationJson))
                .andExpect(status().isUnauthorized());
    }

    // @Test
    // @DisplayName("Should fail registration with non-admin token")
    // void shouldFailRegistrationWithNonAdminToken() throws Exception {
    //     String nonAdminToken = "non_admin_jwt_token";
    //     String registrationJson = """
    //             {
    //                 "login": "testuser123",
    //                 "password": "Password123!",
    //                 "email": "testuser@example.com",
    //                 "firstName": "Test",
    //                 "lastName": "User"
    //             }""";

    //     mockMvc.perform(post("/api/users/register")
    //             .contentType(MediaType.APPLICATION_JSON)
    //             .content(registrationJson)
    //             .header("Authorization", "Bearer " + nonAdminToken))
    //             .andExpect(status().isForbidden());
    // }


    @Test
    @DisplayName("Should display and update task status")
    void shouldUpdateTaskStatus() throws Exception {
        mockMvc.perform(put("/api/tasks/{taskId}/status", 1)
                .param("statusId", "2")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status.id").value(2));

    }

    @Test
    @DisplayName("Should filter tasks by status")
    void shouldFilterTasksByStatus() throws Exception {
        mockMvc.perform(get("/api/tasks")
                .param("page", "0")
                .param("statusId", "1")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[*].status.id").value(everyItem(is(1))));
    }

    @Test
    @DisplayName("Should fail to update status without authorization")
    void shouldFailUpdateStatusWithoutAuth() throws Exception {
        mockMvc.perform(put("/api/tasks/{taskId}/status", 1)
                .param("statusId", "2"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Should fail to update status with invalid status ID")
    void shouldFailUpdateStatusWithInvalidId() throws Exception {
        mockMvc.perform(put("/api/tasks/{taskId}/status", 1)
                .param("statusId", "999")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Should fail to update status of non-existent task")
    void shouldFailUpdateStatusNonExistentTask() throws Exception {
        mockMvc.perform(put("/api/tasks/{taskId}/status", 99999)
                .param("statusId", "2")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }
    
    @Test
    @DisplayName("F20 - Should perform CRUD operations for ideas")
    void shouldPerformIdeaCrudOperations() throws Exception {
        String createIdeaJson = """
                {
                    "description": "idea_description"
                }""";
                
        MvcResult createResult = mockMvc.perform(post("/api/ideas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(createIdeaJson)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.description").value("idea_description"))
                .andExpect(jsonPath("$.authorLogin.login").value("ernst_ignatukev"))
                .andExpect(jsonPath("$.statusEnumId").value("PENDING"))
                .andReturn();

        String responseJson = createResult.getResponse().getContentAsString();
        Integer ideaId = JsonPath.read(responseJson, "$.id");

        String updateIdeaJson = """
                {
                    "description": "updated_idea_description"
                }""";
                
        mockMvc.perform(put("/api/ideas/{id}", ideaId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateIdeaJson)
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("updated_idea_description"));

        mockMvc.perform(put("/api/ideas/{id}/status", ideaId)
                .param("status", "APPROVED")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/ideas")
                .param("page", "0")
                .param("status", "APPROVED")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.page").exists());
    }
}
