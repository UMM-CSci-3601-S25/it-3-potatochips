package umm3601.mongotest.game;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
// import static org.junit.jupiter.api.Assertions.assertThrows;
// import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

// import io.javalin.Javalin;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.validation.BodyValidator;
import umm3601.game.GameController;
// import io.javalin.validation.ValidationException;
import io.javalin.json.JavalinJackson;

class GameControllerSpec {

  private GameController gameController;

  private static MongoClient mongoClient;
  private static MongoDatabase db;

  private static JavalinJackson javalinJackson = new JavalinJackson();

  @Mock
  private Context ctx;

  @Captor
  private ArgumentCaptor<Map<String, String>> mapCaptor;

  @BeforeAll
  static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
        MongoClientSettings.builder()
            .applyToClusterSettings(builder -> builder.hosts(Collections.singletonList(new ServerAddress(mongoAddr))))
            .build());
    db = mongoClient.getDatabase("test");
  }

  @AfterAll
  static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @BeforeEach
  void setupEach() throws IOException {
    MockitoAnnotations.openMocks(this);

    MongoCollection<Document> gameDocuments = db.getCollection("games");
    gameDocuments.drop();

    gameController = new GameController(db);

    Document newGame = new Document();
    newGame.append("players", new String[]{"Alice", "Bob"});
    newGame.append("prompt", "What is the meaning of life?");
    newGame.append("responses", new String[]{"42", "To be happy"});
    newGame.append("judge", 1);
    newGame.append("discardLast", true);
    newGame.append("winnerBecomesJudge", false);

  }




  @Test
  void testGetGame() {
    when(ctx.pathParam("id")).thenReturn("12345");

    gameController.getGame(ctx);

    verify(ctx).json(mapCaptor.capture());
    assertEquals("12345", mapCaptor.getValue().get("id"));
    verify(ctx).status(HttpStatus.OK);
  }

 }
