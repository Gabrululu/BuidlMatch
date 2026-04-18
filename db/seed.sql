-- Dev seed: fictional builders (replace with real FIDs before demo)
-- Skills must match what Co-Builder agents will query

insert into builders (fid, username, bio, skills, wallet, avatar_url) values
  (100001, 'carlos.eth',   'Fullstack + Solidity desde Bogotá. DeFi & infra.', array['Solidity','DeFi','Backend'], '0x0000000000000000000000000000000000000001', null),
  (100002, 'valentina.fc', 'Frontend React + Farcaster frames. Lima.',           array['Frontend','React','Frames'],  '0x0000000000000000000000000000000000000002', null),
  (100003, 'miguel.base',  'Smart contracts + Foundry. CDMX. Auditor.',          array['Solidity','Auditing','EVM'],  '0x0000000000000000000000000000000000000003', null),
  (100004, 'sofia.fc',     'Diseño de producto Web3. Buenos Aires.',              array['Design','UX','Branding'],     '0x0000000000000000000000000000000000000004', null),
  (100005, 'andres.eth',   'GTM & comunidad crypto latam. Santiago.',             array['GTM','Community','BD'],       '0x0000000000000000000000000000000000000005', null),
  (100006, 'lucia.dev',    'Full stack Next.js + wagmi. Medellín.',               array['Frontend','Next.js','wagmi'], '0x0000000000000000000000000000000000000006', null),
  (100007, 'renzo.sol',    'Contratos DeFi + Base. Lima.',                        array['Solidity','DeFi','Base'],     '0x0000000000000000000000000000000000000007', null),
  (100008, 'diana.fc',     'Producto y growth para startups Web3. Caracas.',      array['Product','Growth','GTM'],     '0x0000000000000000000000000000000000000008', null)
on conflict (fid) do nothing;
