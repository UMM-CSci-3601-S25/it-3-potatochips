package umm3601.mongotest.game;

import static org.mockito.Mockito.*;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import io.javalin.Javalin;
import io.javalin.http.HttpStatus;
import umm3601.game.Game;
import umm3601.game.GameController;
import org.mongojack.JacksonMongoCollection;

public class GameControllerSpec {

  private Javalin mockServer;
  private GameController gameController;

  @BeforeEach
  public void setup() {
    mockServer = mock(Javalin.class);
    gameController = new GameController(mock(MongoDatabase.class));
  }

  @Test
  public void testGetGame() {
    Game mockGame = mock(Game.class);
    when(mockGame._id).thenReturn("12345");
    when(mockGame.players).thenReturn(new String[]{"Alice", "Bob"});
    when(mockGame.prompt).thenReturn("What is the meaning of life?");
    when(mockGame.responses).thenReturn(new String[]{"42", "To be happy"});
    when(mockGame.judge).thenReturn(1);
    when(mockGame.scores).thenReturn(new int[]{10, 20});
    when(mockGame.discardLast).thenReturn(true);
    when(mockGame.winnerBecomesJudge).thenReturn(false);

    // JacksonMongoCollection<Game> mockGameCollection = mock(JacksonMongoCollection.class);
    // when(mockGameCollection.find(Filters.eq("_id", new ObjectId("12345"))).first()).thenReturn(mockGame);
    // gameController.gameCollection = mockGameCollection;

    io.javalin.http.Context mockContext = mock(io.javalin.http.Context.class);
    when(mockContext.pathParam("id")).thenReturn("12345");

    gameController.getGame(mockContext);

    verify(mockContext).json(mockGame);
    verify(mockContext).status(HttpStatus.OK);
  }



  @Test
  public void testGetGameWithInvalidId() {
    io.javalin.http.Context mockContext = mock(io.javalin.http.Context.class);
    when(mockContext.pathParam("id")).thenReturn("not-a-valid-id");

    try {
      gameController.getGame(mockContext);
    } catch (io.javalin.http.BadRequestResponse e) {
      verify(mockContext).status(HttpStatus.BAD_REQUEST);
      //random comment
    }
  }

}
