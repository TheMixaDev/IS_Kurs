package net.alephdev.calendar;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.springframework.transaction.annotation.Transactional;





@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserControllerTest extends BaseIntegrationTest {    
    private String jwtToken;
    
    @BeforeEach
    void setUp() throws Exception {
        this.jwtToken = getJwtToken("ernst_ignatukev", "1234567");
    }
    
    @Test
    void shouldGetUserProfile() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/users")
                .param("page", "0")
                .header("Authorization", "Bearer " + jwtToken))
                .andExpect(MockMvcResultMatchers.status().isOk())
                // Проверка пагинации
                .andExpect(MockMvcResultMatchers.jsonPath("$.page.size").value(20))
                .andExpect(MockMvcResultMatchers.jsonPath("$.page.number").value(0))
                .andExpect(MockMvcResultMatchers.jsonPath("$.page.totalElements").value(50))
                .andExpect(MockMvcResultMatchers.jsonPath("$.page.totalPages").value(3));
    }
}
