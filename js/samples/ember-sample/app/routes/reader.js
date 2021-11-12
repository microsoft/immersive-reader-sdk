import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

// This is an example of routing in Ember
export default class ReaderRoute extends Route {
  @service store;
}
