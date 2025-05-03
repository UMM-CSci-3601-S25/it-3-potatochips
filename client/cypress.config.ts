import { defineConfig } from 'cypress';
import { environment } from './src/environments/environment';
import { WebSocketSubject } from 'rxjs/webSocket';

let webSocketSubject;

export default defineConfig({
  e2e: {
    setupNodeEvents: (on, config) => {
      on("task", {
        connect() {
          webSocketSubject = new WebSocketSubject(`${environment.wsUrl}`);
          webSocketSubject.next("connected");
          return null; //cypress needs some returned thing (can be null)
        },
        refreshPage() {
          // we need to trigger the web socket of our game-page to get a message, and that will trigger refreshPage
          //gameComponent = new GameComponent(new ActivatedRoute(),new HttpClient())
          //'/game/681266ce536e072b01791cb6'
          webSocketSubject.next("refresh");
          return null;
        }
      });
      config.baseUrl = 'http://localhost:4200';
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./cypress/plugins/index.ts').default(on, config);

    }
  }
});
