import { action, computed, reaction } from 'mobx'
import { createTransformer } from 'mobx-utils'

export default class ControlPanelVm {
  constructor({ appState, webSocketState }) {
    this.appState = appState
    this.webSocketState = webSocketState

    // just a show case of reaction (it is totally unnecessary)
    // alternative: you can put onDepthChange() inside onSelectDepth(event) to replace this reaction
    this.reaction = reaction(
      () => this.depth,
      () => this.onDepthChange(),
      { fireImmediately: true },
    )
  }

  get depthOptions() {
    return [5, 10, 20]
  }

  async onDepthChange() {
    await this.appState.fetchFavSymbols()

    this.webSocketState.subscribeSymbols(this.appState.favSymbols, this.appState.depth)
  }

  @action.bound
  onSelectDepth(event) {
    this.appState.depth = event.target.value
  }

  @computed
  get depth() {
    return this.appState.depth
  }

  @computed
  get subscribedUrl() {
    return this.webSocketState.url
  }

  @computed
  get subscribedTopics() {
    return this.webSocketState.topics
  }

  // show case of dynamic expression to select data from reactive source
  selectEventUidByTopic(topic) {
    // https://github.com/binance-exchange/binance-official-api-docs/blob/master/web-socket-streams.md
    // depth: lastUpdateId, ticker: E
    const stream = this.webSocketState.streams.get(topic);
    const t = createTransformer(it => it.lastUpdateId || it.E);
    return stream ? t(stream) : undefined;
  }

  dispose() {
    this.reaction()
  }
}
