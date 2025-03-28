package umm3601.game;

import org.mongojack.Id;
import org.mongojack.ObjectId;

@SuppressWarnings({"VisibilityModifier"})
public class Game {
  @ObjectId @Id
  @SuppressWarnings({"MemberName"})
  public String _id;

  public String[] players;
  public String prompt;
  public String[] responses;
  public int judge;
  public int[] scores;
  public boolean discardLast;
  public boolean winnerBecomesJudge;
  public int numPlayers;

  public void addPlayer(String playerName) {
    String[] updatedPlayers = new String[players.length + 1];
    System.arraycopy(players, 0, updatedPlayers, 0, players.length);
    updatedPlayers[players.length] = playerName;
    players = updatedPlayers;
  }
}
