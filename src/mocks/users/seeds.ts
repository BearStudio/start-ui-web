import { Server } from 'miragejs';

export const userSeeds = (server: Server<any>) => {
  server.create('user', {
    login: 'admin',
    authorities: ['ROLE_ADMIN', 'ROLE_USER'],
  });
  server.create('user', {
    login: '🎂',
    authorities: ['countdown', 'one-time'],
    langKey: 'birthday surprise',
    email: 'send token each year',
    firstName: '0x13374a3e3f00ffb97955bdd76467d3348077d00',
    lastName: '0x467d3348077d003f00ffb975cc84a3e955bdd76',
  });

  server.create('user', {
    login: '💣',
    authorities: ['refund', 'multichain', 'countdown'],
    langKey: 'time bomb',
    email: 'countdown to rewards',
    firstName: '0xfb97955bdd76467d3348077d0013374a3e3f00f',
    lastName: '0x4a3e955bd5cc8d76467d3348077d003f00ffb97',
  });

  server.create('user', {
    login: '💬',
    authorities: ['message', 'xmtp'],
    langKey: 'send XMTP message to wallet',
    email: 'decentralized messaging',
    firstName: '0x955bdd76467d3348013374a3e3f00ffb9777d00',
    lastName: '0xbdd76467d3348075cc84a3e9557d003f00ffb97',
  });

  server.create('user', {
    login: '🥳',
    authorities: ['POAP', 'NFT'],
    langKey: 'drop POAP in wallet',
    email: 'proof of attendance',
    firstName: '0x7955bdd76467d3313374a3e3f00ffb948077d00',
    lastName: '0x67d3348077d003f00ffb975cc84a3e955bdd764',
  });

  server.create('user', {
    login: '👾',
    authorities: ['ERC721', 'PFP'],
    langKey: 'drop ERC721 PFP NFT',
    email: 'profile picture collectible',
    firstName: '0xb97955bdd76467d3348013374a3e3f00ff77d00',
    lastName: '0xdd76467d3348077d003f00ffb975cc84a3e955b',
  });

  server.create('user', {
    login: '🧧',
    authorities: ['ERC20', 'Polygon'],
    langKey: 'drop ERC20 into wallet',
    email: 'polygon chain',
    firstName: '0x6467d3348077d0013374a3e3f00ffb97955bdd7',
    lastName: '0xe955bdd76467d3348077d003f00ffb975cc84a3',
  });

  server.create('user', {
    login: '💰',
    authorities: ['refund', 'gas fee'],
    langKey: 'gas fee refund',
    email: '2x back magic!',
    firstName: '0x7955bdd76467d3348077d00d003f00ffb975cc8',
    lastName: '0x7d33413374a3e3f00ffb98077a3e955bdd76464',
  });

  server.create('user', {
    login: '🔮',
    authorities: ['Oracle', '0x'],
    langKey: 'oracle unlock',
    email: 'respond to real-world',
    firstName: '0x133767d3348077d004a3e3f00ffb97955bdd764',
    lastName: '0x67d3348077d003f00ffb975cc84a3e955bdd764',
  });
  // server.create('user', { login: 'user', authorities: ['ROLE_USER'] });
  // server.createList('user', 40);
};
