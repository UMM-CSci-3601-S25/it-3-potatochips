package umm3601;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

import org.bson.UuidRepresentation;
import org.bson.json.JsonObject;
import org.json.JSONObject;

import io.javalin.Javalin;
import io.javalin.http.InternalServerErrorResponse;
import io.javalin.websocket.WsContext;


/**
 * The class used to configure and start a Javalin server.
 */
public class Server {

  // The port that the server should run on.
  private static final int SERVER_PORT = 4567;

  // How long we should wait between updating we sockets information
  private static final long WEB_SOCKET_PING_INTERNAL = 5;

  // Clients connection via web sockets
  private static Set<WsContext> connectedClients = ConcurrentHashMap.newKeySet();

  // The `mongoClient` field is used to access the MongoDB
  private final MongoClient mongoClient;


  // The `controllers` field is an array of all the `Controller` implementations
  // for the server. This is used to add routes to the server.
  private Controller[] controllers;


  // Update the Game State
  private int currentRound = 1;
  private Map<String, Integer> playerScores = new HashMap<>(); // Player name -> score
  private String currentJudge = null;
  private String roundWinner = null;
  private String gameWinner = null;

  // Game Management
  private Map<String, Map<String, Integer>> gamePlayerScores = new ConcurrentHashMap<>(); // gameCode -> playerScores
  private Map<String, Set<WsContext>> gameConnections = new ConcurrentHashMap<>(); // gameCode -> connectedClients
  private Map<WsContext, String> clientsGames = new ConcurrentHashMap<>(); // client -> gameCode
  private Map<WsContext, String> clientIds = new ConcurrentHashMap<>(); // Map WsContext to custom ID
  /**
   * Construct a `Server` object that we'll use (via `startServer()`) to configure
   * and start the server.
   *
   * @param mongoClient The MongoDB client object used to access to the database
   * @param controllers The implementations of `Controller` used for this server
   */
  public Server(MongoClient mongoClient, Controller[] controllers) {
    this.mongoClient = mongoClient;
    // This is what is known as a "defensive copy". We make a copy of
    // the array so that if the caller modifies the array after passing
    // it in, we don't have to worry about it. If we didn't do this,
    // the caller could modify the array after passing it in, and then
    // we'd be using the modified array without realizing it.
    this.controllers = Arrays.copyOf(controllers, controllers.length);
  }

  /**
   * Setup the MongoDB database connection.
   *
   * This "wires up" the database using either system environment variables
   * or default values. If you're running the server locally without any environment
   * variables set, this will connect to the `dev` database running on your computer
   * (`localhost`). If you're running the server on Digital Ocean using our setup
   * script, this will connect to the production database running on server.
   *
   * This sets both the `mongoClient` and `database` fields
   * so they can be used when setting up the Javalin server.
   * @param mongoAddr The address of the MongoDB server
   *
   * @return The MongoDB client object
   */
  static MongoClient configureDatabase(String mongoAddr) {
    // Setup the MongoDB client object with the information we set earlier
    MongoClient mongoClient = MongoClients.create(MongoClientSettings
      .builder()
      .applyToClusterSettings(builder -> builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
      // Old versions of the mongodb-driver-sync package encoded UUID values (universally unique identifiers) in
      // a non-standard way. This option says to use the standard encoding.
      // See: https://studio3t.com/knowledge-base/articles/mongodb-best-practices-uuid-data/
      .uuidRepresentation(UuidRepresentation.STANDARD)
      .build());

    return mongoClient;
  }

  /**
   * Configure and start the server.
   *
   * This configures and starts the Javalin server, which will start listening for HTTP requests.
   * It also sets up the server to shut down gracefully if it's killed or if the
   * JVM is shut down.
   */
  // void startServer() {
  //   Javalin javalin = configureJavalin();
  //   setupRoutes(javalin);
  //   javalin.start(SERVER_PORT);
  //}

  void startServer() {
    System.out.println("Starting server...");
    Javalin javalin = configureJavalin();
    setupRoutes(javalin);
    System.out.println("Server started on port" + SERVER_PORT);
  }
  /**
   * Configure the Javalin server. This includes
   *
   * - Adding a route overview plugin to make it easier to see what routes
   *   are available.
   * - Setting it up to shut down gracefully if it's killed or if the
   *   JVM is shut down.
   * - Setting up a handler for uncaught exceptions to return an HTTP 500
   *   error.
   *
   * @return The Javalin server instance
   */
  // private Map<WsContext, String> clientIds = new ConcurrentHashMap<>(); // Map WsContext to custom ID

  private Javalin configureJavalin() {
    /*
     * Create a Javalin server instance. We're using the "create" method
     * rather than the "start" method here because we want to set up some
     * things before the server actually starts. If we used "start" it would
     * start the server immediately and we wouldn't be able to do things like
     * set up routes. We'll call the "start" method later to actually start
     * the server.
     *
     * `plugins.register(new RouteOverviewPlugin("/api"))` adds
     * a helpful endpoint for us to use during development. In particular
     * `http://localhost:4567/api` shows all of the available endpoints and
     * what HTTP methods they use. (Replace `localhost` and `4567` with whatever server
     * and  port you're actually using, if they are different.)
     */
    Javalin server = Javalin.create(config ->
      config.bundledPlugins.enableRouteOverview("/api")
    );

    System.out.println("Configuring WebSocket endpoint...");
    server.ws("/api/websocket", ws -> {
      System.out.println("WebSocket endpoint created");

      ws.onConnect(ctx -> {
        connectedClients.add(ctx);
        ctx.enableAutomaticPings(WEB_SOCKET_PING_INTERNAL, TimeUnit.SECONDS);
        System.out.println("Client connected");

        String clientId = UUID.randomUUID().toString(); // will generate a unique ID
        clientIds.put(ctx, clientId); // associated ID th WsContext
        playerScores.put(clientId, 0); // Initialize the score

        // broadcastGameState(); // send the initial game state
      });

      ws.onMessage(ctx -> {
        String message = ctx.message();
        System.out.println("Received message from client");
        //broadcastMessage(message);
        handleMessage(ctx, message);
      });

      ws.onClose(ctx -> {
        String clientId = clientIds.get(ctx);
        if (clientId != null) {
            playerScores.remove(clientId);
        }
        String gameCode = clientsGames.get(ctx);
        if (gameCode != null) {
          gameConnections.get(gameCode).remove(ctx);
        }
        clientIds.remove(ctx);
        clientsGames.remove(ctx);
        connectedClients.remove(ctx);
        System.out.println("Client disconnected");
        broadcastGameState(clientsGames.get(ctx));
      });

    });

    // Configure the MongoDB client and the Javalin server to shut down gracefully.
    configureShutdowns(server);

    // This catches any uncaught exceptions thrown in the server
    // code and turns them into a 500 response ("Internal Server
    // Error Response"). In general you'll like to *never* actually
    // return this, as it's an instance of the server crashing in
    // some way, and returning a 500 to your user is *super*
    // unhelpful to them. In a production system you'd almost
    // certainly want to use a logging library to log all errors
    // caught here so you'd know about them and could try to address
    // them.
    server.exception(Exception.class, (e, ctx) -> {
      throw new InternalServerErrorResponse(e.toString());
    });

    return server;
  }


  /** Handle message
   * this will  process the messages received from the clients
     Process messages like "judge:player1", "winner:player2", "nextRound"
   */

  private void handleMessage(WsContext ctx, String message){
    if (message.startsWith("host:")) {
      String gameCode = UUID.randomUUID().toString().substring(0, 10); //A unique 6-character game
      // code is generated using UUID to ensure uniqueness.

      gameConnections.put(gameCode, ConcurrentHashMap.newKeySet()); // A new entry is created in the gameConnections map, associating the
      // generated gameCode with an empty set of WsContext objects

      gameConnections.get(gameCode).add(ctx); // The current client (ctx) will be added to the set of clients associated with the generated 'gameCode'
      clientsGames.put(ctx, gameCode); // The 'clientGames' map will be updated to associate the current client (ctx) with the generated 'gameCode'.

      gamePlayerScores.put(gameCode, new HashMap<>()); // A new entry is created in 'gamePlayerScores', creating a HashMap to store the scores of the players in this game.
      clientIds.forEach((key, value) -> {
        gamePlayerScores.get(gameCode).put(value, 0);
      }); // iterates through all the current connected clients, and adds them to the 'gamePlayerScores' hashmap, with an initial score of 0.

      ctx.send("gameCode:" + gameCode); // The generated 'gameCode' is sent back to the client as a message, so they can share it with other players.

      // logic for joining the game:
    } else if (message.startsWith("join:")) {
      String gameCode = message.substring(5); // The game code is extracted from the message (after the "join:" prefix).

      if (gameConnections.containsKey(gameCode)) { //  Checks if a game with the extracted gameCode exists.
        gameConnections.get(gameCode).add(ctx);
        clientsGames.put(ctx, gameCode);
        gamePlayerScores.get(gameCode).put(clientIds.get(ctx), 0); // The joining player is added to the gamePlayerScores hashmap with an initial score of zero.
        ctx.send("joined:" + gameCode); // A confirmation message is sent back to the client.

      } else {
        ctx.send("error:Game not found");
      }
        // logic for the judge
    } else if (message.startsWith("judge:")) {
      currentJudge = message.substring(6);
      broadcastGameState(clientsGames.get(ctx));

    }else if (message.startsWith("Winner:")) {
      String winningPlayer = message.substring(7);
      playerScores.merge(winningPlayer, 1, Integer::sum);
      roundWinner = winningPlayer;
      broadcastGameState(clientsGames.get(ctx));

      // here we are checking for the game winner logic, and then update the gameWinner
    }else if (message.equals("nextRound")) {
      currentRound++;
      roundWinner = null;
      broadcastGameState(clientsGames.get(ctx));

    }
    broadcastMessage(message);
  }

  private void broadcastGameState(String gameCode) {
    if (gameCode == null || !gameConnections.containsKey((gameCode))) {
      return;
    }
    Map<String, Object> gameState = new HashMap<>();
    gameState.put("currentRound", currentRound);
    gameState.put("playerScores", playerScores);
    gameState.put("currentJudge", currentJudge);
    gameState.put("roundWinner", roundWinner);
    gameState.put("gameWinner", gameWinner);

    JSONObject jsonObject = new JSONObject(gameState);
    String gameStateJson = jsonObject.toString();
    broadcastMessage(gameStateJson);

  }
   /**
   * Broadcast a message to all connected WebSocket clients.
   *
   * @param message The message to broadcast
   */
  private static void broadcastMessage(String message) {
    for (WsContext client : connectedClients) {
      client.send(message);
    }
  }
   /*
   *  Configure the server and the MongoDB client to shut down gracefully.
   *
   * @param server The Javalin server instance
   * @see   #mongoClient The MongoDB client field is used to access the MongoDB
   */
  private void configureShutdowns(Javalin server) {
    /*
     * We want the server to shut down gracefully if we kill it
     * or if the JVM dies for some reason.
     */
    Runtime.getRuntime().addShutdownHook(new Thread(server::stop));
    /*
     * We want to shut the `mongoClient` down if the server either
     * fails to start, or when it's shutting down for whatever reason.
     * Since the mongClient needs to be available throughout the
     * life of the server, the only way to do this is to wait for
     * these events and close it then.
     */
    server.events(event -> {
      event.serverStartFailed(mongoClient::close);
      event.serverStopped(mongoClient::close);
    });
  }

  /**
   * Setup routes for the server.
   *
   * @param server The Javalin server instance
   */
  private void setupRoutes(Javalin server) {
    // Add the routes for each of the implementations of `Controller` in the
    // `controllers` array.
    for (Controller controller : controllers) {
      controller.addRoutes(server);
    }
  }
}
