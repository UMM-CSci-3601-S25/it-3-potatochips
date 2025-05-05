package umm3601.mongotest;

import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.Test;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;

import umm3601.Controller;
import umm3601.Server;

import umm3601.game.GameController;

public class ServerSpec {
  @Test
  void test() throws InterruptedException {
    String mongoAddr = "localhost";
    String databaseName = "dev";
    MongoClient mongoClient = Server.configureDatabase(mongoAddr);
    // Get the database
    MongoDatabase database = mongoClient.getDatabase(databaseName);
    final Controller[] controllers = ServerSpec.getControllers(database);
    final Server server = new Server(mongoClient, controllers);
    server.startServer();
    TimeUnit.SECONDS.sleep(10);
  }

  static Controller[] getControllers(MongoDatabase database) {
    Controller[] controllers = new Controller[] {
      new GameController(database)
    };
    return controllers;
  }
}
