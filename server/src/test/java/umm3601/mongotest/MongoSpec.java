package umm3601.mongotest;

import static com.mongodb.client.model.Filters.eq;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;

import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;


import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.json.JavalinJackson;
import io.javalin.validation.BodyValidator;
import umm3601.game.Game;
import umm3601.game.GameController;

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

/**
 * Some simple "tests" that demonstrate our ability to
 * connect to a Mongo database and run some basic queries
 * against it.
 * <p>
 * Note that none of these are actually tests of any of our
 * code; they are mostly demonstrations of the behavior of
 * the MongoDB Java libraries. Thus if they test anything,
 * they test that code, and perhaps our understanding of it.
 * <p>
 * To test "our" code we'd want the tests to confirm that
 * the behavior of methods in things like the UserController
 * do the "right" thing.
 */
// The tests here include a ton of "magic numbers" (numeric constants).
// It wasn't clear to me that giving all of them names would actually
// help things. The fact that it wasn't obvious what to call some
// of them says a lot. Maybe what this ultimately means is that
// these tests can/should be restructured so the constants (there are
// also a lot of "magic strings" that Checkstyle doesn't actually
// flag as a problem) make more sense.
@SuppressWarnings({"MagicNumber"})
class GameControllerSpec {

  private MongoCollection<Document> gameDocuments;

  private static MongoClient mongoClient;
  private static MongoDatabase db;
  private GameController gameController;
  private JavalinJackson javalinJackson = new JavalinJackson();

  @Mock
  private Context ctx;

  @Captor
  private ArgumentCaptor<ArrayList<Game>> gameArrayListCaptor;

  @Captor
  private ArgumentCaptor<Game> gameCaptor;

  @Captor
  private ArgumentCaptor<Map<String, String>> mapCaptor;

  @BeforeAll
  static void setupDB() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
      MongoClientSettings.builder()
      .applyToClusterSettings(builder ->
        builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
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
    // Reset our mock context and argument captor (declared with Mockito
    // annotations @Mock and @Captor)
    MockitoAnnotations.openMocks(this);

    gameController = new GameController(db);
  }

  @Test
  void addNewGame() throws IOException {
    // Create a new user to add
    Game newGame = new Game();
    newGame.judge = 1;
    newGame.discardLast = false;
    newGame.winnerBecomesJudge = false;

    String newGameJson = javalinJackson.toJsonString(newGame, Game.class);

    // A `BodyValidator` needs
    //   - The string (`newUserJson`) being validated
    //   - The class (`User.class) it's trying to generate from that string
    //   - A function (`() -> User`) which "shows" the validator how to convert
    //     the JSON string to a `User` object. We'll again use `javalinJackson`,
    //     but in the other direction.
    when(ctx.bodyValidator(Game.class))
      .thenReturn(new BodyValidator<Game>(newGameJson, Game.class,
                    () -> javalinJackson.fromJsonString(newGameJson, Game.class)));

    gameController.addNewGame(ctx);
    verify(ctx).json(mapCaptor.capture());

    // Our status should be 201, i.e., our new user was successfully created.
    verify(ctx).status(HttpStatus.CREATED);

    // Verify that the user was added to the database with the correct ID
    Document addedGame = db.getCollection("games")
        .find(eq("_id", new ObjectId(mapCaptor.getValue().get("id")))).first();

    // Successfully adding the user should return the newly generated, non-empty
    // MongoDB ID for that user.
    assertNotEquals("", addedGame.get("id"));
    // The new user in the database (`addedUser`) should have the same
    // field values as the user we asked it to add (`newUser`).

    assertEquals(newGame.judge, addedGame.get("judge"));
    assertEquals(newGame.discardLast, addedGame.get("discardLast"));
    assertEquals(newGame.winnerBecomesJudge, addedGame.get("winnerBecomesJudge"));
  }
}

