// Wraps either a slash interaction or a prefix message into one unified API.
// Commands call ctx.reply(), ctx.getInteger(), etc. without caring which format was used.
class Context {
  constructor(source, args = []) {
    this.isSlash = typeof source.isChatInputCommand === 'function';
    this._source = source;
    this._args = args;
    this._loadingMsg = null;

    this.user = this.isSlash ? source.user : source.author;
    this.guild = source.guild;
  }

  getInteger(name, index = 0) {
    if (this.isSlash) return this._source.options.getInteger(name);
    const val = parseInt(this._args[index], 10);
    return isNaN(val) ? null : val;
  }

  getString(name, index = 0) {
    if (this.isSlash) return this._source.options.getString(name);
    return this._args[index]?.toLowerCase() ?? null;
  }

  getUser(name) {
    if (this.isSlash) return this._source.options.getUser(name);
    return this._source.mentions.users.first() ?? null;
  }

  async reply(options) {
    if (typeof options === 'string') options = { content: options };
    if (!this.isSlash) {
      const { ephemeral, ...rest } = options;
      return this._source.reply(rest);
    }
    return this._source.reply(options);
  }

  // For leaderboard — sends a "Loading..." placeholder then editReply() updates it
  async deferReply() {
    if (this.isSlash) return this._source.deferReply();
    this._loadingMsg = await this._source.reply('⏳ Loading...');
  }

  async editReply(options) {
    if (typeof options === 'string') options = { content: options };
    if (this.isSlash) return this._source.editReply(options);
    const { ephemeral, ...rest } = options;
    return this._loadingMsg ? this._loadingMsg.edit(rest) : this._source.reply(rest);
  }

  async followUp(options) {
    if (typeof options === 'string') options = { content: options };
    if (!this.isSlash) {
      const { ephemeral, ...rest } = options;
      return this._source.channel.send(rest);
    }
    return this._source.followUp(options);
  }

  get replied() { return this.isSlash ? this._source.replied : false; }
  get deferred() { return this.isSlash ? this._source.deferred : !!this._loadingMsg; }
}

module.exports = Context;
