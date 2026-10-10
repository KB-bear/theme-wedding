'use strict';
/* =========================================================
   THEME WEDDING — random & scripted events
   Each build() returns {title, text, choices:[{label, fn}]} or null.
   fn() applies effects and returns the outcome text.
   ========================================================= */

function gN() { return G.gName; }
function bN() { return G.bName; }
function anyGuest(f) { return randGuest(p => !p.look.kid && (!f || f(p))); }
function hasBouncer() { return staffOf('bouncer').some(b => b.present); }

const EVENTS = [
  // ===================== CEREMONY =====================
  { id: 'object', pool: 'ceremony', build() {
    const g = anyGuest(p => !p.vip); if (!g) return null;
    return { title: 'SPEAK NOW...', text: `"If anyone knows of any reason why these two should not be wed..." A chair scrapes. ${g.name} stands up at the back and takes a deep breath.`, choices: [
      { label: 'Glare at them', fn() {
        if (chance(0.55)) { joy(20); return `They sit back down. They were only stretching their legs. Everyone breathes out.`; }
        joy(60); memory('"I object... to how gorgeous you both look!"', 50); moodAll(5); return `"I object... to how GORGEOUS you both look!" The whole garden cheers.`; } },
      { label: 'Let them speak', fn() {
        const r = Math.random();
        if (r < 0.4) { joy(40); return `"I object to the vegan option!" Laughter all round. Even the registrar smirks.`; }
        if (r < 0.7) { joy(25); interrupt(g); leave(g, 'taxi'); return `"Oh... sorry, wrong wedding." They shuffle off to the venue next door.`; }
        joy(50); bliss(5); memory('The surprise love speech', 40); return `It's a heartfelt little speech about true love. Not a dry eye in the garden.`; } },
      { label: hasBouncer() ? 'Bouncer, remove them!' : 'Bouncer! (you have none)', fn() {
        if (!hasBouncer()) { bliss(-3); return `You don't have a bouncer. The registrar just shushes them. Awkward.`; }
        joy(15); interrupt(g); leave(g, 'taxi'); return `The bouncer escorts them out. Turns out they were a lost rambler.`; } },
    ] };
  } },
  { id: 'rings', pool: 'ceremony', build() {
    const bm = G.bestMan;
    return { title: 'THE RINGS!', text: `"The rings, please." ${bm.name} pats every pocket. Then pats them all again. His face goes the colour of the tablecloths.`, choices: [
      { label: 'Check his other jacket', fn() {
        if (chance(0.5)) { joy(20); return `Inside pocket. Phew. He's sweating through his shirt.`; }
        joy(35); memory('Rings recovered from a sock', 40); return `Not there. ...They were in his SOCK. Nobody asks why.`; } },
      { label: 'Ask the page boy', fn() {
        if (chance(0.6)) { joy(45); memory('The dinosaur ring bearer', 40); return `The page boy had them all along, tied to a plastic T-rex. Adorable.`; }
        joy(25); bliss(-4); return `He's swapped them for a Haribo ring. The real ones turn up later in the hedge.`; } },
      { label: 'Use a ring pull from a can', fn() { joy(35); bliss(-2); later(ri(150, 250), () => { msg(bN() + "'s finger has gone slightly green from the ring pull. She's laughing about it. Mostly.", ''); joy(10, true); }); return `${gN()} slides a ring pull onto ${bN()}'s finger. Romantic in its own way. Big cheer.`; } },
    ] };
  } },
  { id: 'phone', pool: 'ceremony', build() {
    const g = anyGuest(); if (!g) return null;
    return { title: 'RING RING!', text: `Right in the middle of the vows a phone blasts out a VERY loud ringtone. It's ${g.name}'s. It's the Crazy Frog.`, choices: [
      { label: 'Pause and wait for it', fn() { joy(25); funAll(-10); return `It rings for a full minute. An auntie starts dancing to it in her seat.`; } },
      { label: `${gN()} answers it`, fn() {
        if (chance(0.5)) { joy(60); bliss(5); memory('Nan on speakerphone from Australia', 50); return `It's ${gN()}'s nan calling from Australia! She says congratulations on speakerphone. Tears all round.`; }
        joy(45); return `It's a call about an accident that wasn't your fault. ${gN()} politely declines. Biggest laugh of the day.`; } },
      { label: 'Throw it in the pond', fn() { joy(15); g.happy -= 40; return `Into the ornamental pond it goes. ${g.name} is livid. Everyone else is delighted.`; } },
    ] };
  } },
  { id: 'hiccups', pool: 'ceremony', build() {
    return { title: 'HIC!', text: `${gN()} has the hiccups. Every "I do" comes out as "I d-HIC". His ginger ears are glowing bright red.`, choices: [
      { label: 'Glass of water', fn() {
        if (chance(0.6)) { joy(15); return `Cured! He gets through the vows like a pro.`; }
        joy(30); bliss(-3); G.groomStain = true; return `He tries drinking it upside down and pours it straight down his beige waistcoat.`; } },
      { label: 'Give him a fright', fn() {
        if (chance(0.5)) { joy(50); memory('The registrar fainted', 40); return `${G.bestMan.name} yells BOO. The registrar faints. Hiccups cured!`; }
        joy(40); bliss(3); return `Nothing. Now ${bN()} has them too. Hiccupping in harmony. Beautiful.`; } },
      { label: 'Carry on regardless', fn() { joy(35); return `"I d-HIC." Legally binding. The front row are in bits.`; } },
    ] };
  } },
  { id: 'petals', pool: 'ceremony', build() {
    return { title: 'PETAL STORM', text: `The flower girl has gone rogue. She is hurling petals by the fistful directly into guests' faces. Some at speed.`, choices: [
      { label: 'Let her cook', fn() { joy(30); funAll(-10); messNear('petals', 6, 6, 4, 3); confettiAt(6, 6, 30); return `Absolute carnage. An auntie gets one right in the ear. Everyone loves it.`; } },
      { label: 'Gently intervene', fn() {
        if (chance(0.6)) { joy(15); return `She hands over the basket with a little curtsey. Aww.`; }
        joy(25); return `She bites you. Not hard. Everyone agrees it was adorable.`; } },
    ] };
  } },
  // ===================== RECEPTION =====================
  { id: 'photo', pool: 'reception', weight: 2, build() {
    return { title: 'SAY CHEESE!', text: `The photographer wants a big group photo on the lawn. Rounding everyone up could take a while...`, choices: [
      { label: 'Everyone, NOW!', fn() {
        for (const p of guests()) { if (['idle', 'walk', 'chat', 'queue', 'dance'].includes(p.state)) { interrupt(p); goWatch(p, 'photo'); p.timerPhoto = 8; } }
        joy(45); memory('The big group photo', 40);
        if (chance(0.35)) { joy(20); return `Click! Lovely. And ${anyGuest()?.name || 'someone'} photobombed it from up a tree. Even better.`; }
        return `Click! Everyone squeezed in. That one's going on the mantelpiece.`; } },
      { label: 'Family only', fn() { joy(20); bliss(3); return `A quick, tidy family photo. Uncle Gerald blinked. Twice.`; } },
      { label: 'Skip it', fn() { bliss(-5); return `The Mother of the Bride will remember this. For years.`; } },
    ] };
  } },
  { id: 'rain', pool: 'reception', cond: () => G.weather !== 'Sunny' && G.weather !== 'Scorching' && !G.raining, build() {
    return { title: 'DARK CLOUDS', text: `A big grey cloud is rolling in over the garden. It looks... wet.`, choices: [
      { label: 'Everyone inside!', fn() { startRain(30); for (const p of guests()) if (isOutdoor(Math.floor(p.x), Math.floor(p.y)) && ['idle', 'walk', 'chat'].includes(p.state)) { interrupt(p); wander(p, 'hall'); } joy(5); return `A stampede of fascinators into the hall. Dry, at least.`; } },
      { label: "Umbrellas! We're British!", fn() {
        startRain(30);
        if (chance(0.5)) { joy(40); memory('Singing in the rain', 40); return `Everyone dances in the rain. Unbelievable photos.`; }
        moodAll(-10, p => isOutdoor(Math.floor(p.x), Math.floor(p.y))); return `Soggy fascinators everywhere. Someone's fake tan is running.`; } },
      { label: 'Pray', fn() {
        if (chance(0.4)) { joy(30); return `The cloud swerves at the last second. A miracle!`; }
        startRain(40); moodAll(-8); return `Downpour. Biblical. You should have prayed harder.`; } },
    ] };
  } },
  { id: 'goat', pool: 'reception', cond: () => !G.people.some(a => a.role === 'goat' && a.present), weight: 1.2, build() {
    return { title: 'BAAA!', text: `A goat has wandered in from the farm next door. It is eating the flower arrangements with real commitment.`, choices: [
      { label: hasBouncer() ? 'Bouncer, get it!' : 'Bouncer! (you have none)', fn() {
        const a = spawnAnimal('goat', false);
        if (!hasBouncer()) { joy(5); return `No bouncer. The goat is now roaming free. Hire one to chase it off!`; }
        joy(15); a.idleT = 3; return `The bouncer rolls up his sleeves. This could take a minute.`; } },
      { label: "It's our mascot now", fn() {
        const a = spawnAnimal('goat', true); a.friendly = true; joy(30); memory('The wedding goat', 40);
        return `Someone ties a pink ribbon on it. The goat is now a guest. It may eat things. Keep an eye on the cake...`; } },
      { label: 'Lure it away with canapés', fn() {
        if (chance(0.6)) { joy(20); return `It follows a trail of mini quiches right back out of the gate.`; }
        joy(10); cash(-50); return `It eats the canapés AND a tablecloth, then leaves. That'll be £50.`; } },
    ] };
  } },
  { id: 'drone', pool: 'reception', build() {
    const g = anyGuest(); if (!g) return null;
    return { title: 'DRONE ZONE', text: `${g.name} has brought a drone "for aerial shots". It's wobbling dangerously close to ${bN()}'s veil.`, choices: [
      { label: 'Let them fly it', fn() {
        if (chance(0.5)) { joy(50); memory('The epic drone shot', 40); return `Stunning aerial shot of everyone waving. Genuinely beautiful.`; }
        joy(30); return `It crashes into a tree. Then into a second, completely different tree.`; } },
      { label: 'Confiscate it', fn() { joy(5); g.happy -= 20; return `${g.name} sulks by the canapés for the rest of the afternoon.`; } },
    ] };
  } },
  { id: 'aunts', pool: 'reception', build() {
    const a = anyGuest(p => p.look.dress && !p.vip), b = anyGuest(p => p.look.dress && p !== a && !p.vip); if (!a || !b) return null;
    return { title: 'WHO WORE IT BEST?', text: `${a.name} and ${b.name} have turned up in the exact same dress. The temperature on the lawn has dropped ten degrees.`, choices: [
      { label: "Hold a 'who wore it best' vote", fn() { const l = chance(0.5) ? a : b; l.happy -= 35; joy(40); return `The crowd votes. ${l.name} loses and goes to "get some air". For an hour.`; } },
      { label: "Tell them it's 'twinning'", fn() {
        if (chance(0.6)) { a.happy += 10; b.happy += 10; joy(25); return `They LOVE it. Matching selfies all afternoon.`; }
        bliss(-3); joy(10); return `They team up and start critiquing the Mother of the Bride's hat instead.`; } },
      { label: 'Spill wine on one "by accident"', fn() { spawnMess('spill', a.x, a.y); a.happy -= 20; b.happy += 15; joy(20); return `Problem solved. Morally questionable, but solved.`; } },
    ] };
  } },
  { id: 'seagull', pool: 'reception', build() {
    return { title: 'SEAGULL ATTACK', text: `A seagull the size of a small dog has swooped down and nicked a sausage roll straight out of an auntie's hand.`, choices: [
      { label: 'Throw a bread roll at it', fn() {
        if (chance(0.5)) { joy(30); return `Direct hit! The aunties give you a standing ovation.`; }
        moodAll(-5); joy(15); return `It catches it mid-air. Now there are six of them.`; } },
      { label: 'Move the nibbles inside', fn() { joy(5); return `Sensible. Boring, but sensible.`; } },
    ] };
  } },
  { id: 'swan', pool: 'reception', build() {
    return { title: 'MELTING SWAN', text: `The ice sculpture swan has started melting in the sun. It now looks less like a swan and more like... something else. People are pointing.`, choices: [
      { label: 'Cover it with a tablecloth', fn() { joy(10); return `Crisis averted. Mostly.`; } },
      { label: "Rename it 'Modern Art'", fn() {
        if (chance(0.5)) { joy(35); memory('The scandalous ice swan', 40); return `A local art lecturer calls it "provocative". It's the talk of the day.`; }
        joy(20); return `Nobody's buying it. But they're all laughing.`; } },
      { label: 'Leave it', fn() {
        if (chance(0.5)) { joy(40); return `It becomes the most photographed thing at the wedding.`; }
        bliss(-5); return `The Mother of the Bride sees it. Her face. Oh, her face.`; } },
    ] };
  } },
  { id: 'wasp', pool: 'reception', build() {
    return { title: 'WASP!', text: `A wasp is circling the prosecco. Three grown men are flapping like windmills.`, choices: [
      { label: 'Stay calm', fn() {
        if (chance(0.6)) { joy(10); return `It flies off. Calm prevails.`; }
        const g = anyGuest(); if (g) g.happy -= 20; joy(5); return `${g ? g.name : 'Someone'} gets stung on the bum. Arnica all round.`; } },
      { label: 'Waft it with a menu', fn() {
        if (chance(0.5)) { joy(20); return `Shooed! You are a hero.`; }
        joy(30); return `You waft it straight into ${G.bestMan.name}. His lip swells up just in time for the photos.`; } },
    ] };
  } },
  // ===================== DINNER =====================
  { id: 'mixup', pool: 'dinner', build() {
    const g = anyGuest(); if (!g) return null;
    return { title: 'WRONG ORDER', text: `${g.name} ordered the beef but got the vegan wellington. They're staring at it like it's personally insulted them.`, choices: [
      { label: 'Swap with a vegan', fn() { joy(chance(0.5) ? 25 : 15); g.happy += 10; return `Plates are swapped across the table. Mutual respect is achieved.`; } },
      { label: "Tell them it's beef", fn() {
        if (chance(0.6)) { joy(30); g.happy += 10; return `"Best beef I've ever had." Nobody tells them.`; }
        g.happy -= 30; joy(10); return `They find out. They are telling everyone about it.`; } },
    ] };
  } },
  { id: 'foodfight', pool: 'dinner', build() {
    return { title: 'FOOD FIGHT!', text: `A bread roll flies from the kids' end of the table. Then another. Then an uncle throws one back. It's escalating.`, choices: [
      { label: 'Stop it now!', fn() { joy(5); moodAll(-5, p => p.look.kid); return `Order is restored. The kids glare at you.`; } },
      { label: 'Join in!', fn() { joy(50); bliss(-2); memory('The Great Bread Roll War', 50); messNear('litter', 19, 7, 5, 4); funAll(-25); return `Total war. ${gN()} takes a roll to the head and loves every second.`; } },
      { label: 'Let the waiters handle it', fn() {
        if (staffOf('waiter').length) { joy(15); return `The waiters take away the bread baskets. Ammo gone, war over.`; }
        messNear('litter', 19, 7, 3, 4); joy(10); return `There are no waiters. It goes on for some time.`; } },
    ] };
  } },
  { id: 'clink', pool: 'dinner', weight: 1.5, build() {
    return { title: 'CLINK CLINK', text: `The whole room is tapping glasses with their spoons. They want a kiss!`, choices: [
      { label: 'A little peck', fn() { joy(15); bliss(2); heartsAt(G.groom.x, G.groom.y, 6); return `Aww. Polite applause.`; } },
      { label: 'A full Hollywood dip', fn() {
        heartsAt(G.groom.x, G.groom.y, 14);
        if (chance(0.7)) { joy(40); bliss(5); memory('The Hollywood dip', 40); return `${gN()} dips ${bN()} like a film star. The room goes wild.`; }
        joy(45); bliss(-2); memory('The Dip of Doom', 50); return `${gN()} dips too far. They both end up under the top table.`; } },
    ] };
  } },
  { id: 'soup', pool: 'dinner', build() {
    const gran = anyGuest(p => p.look.sex === 'f' && !p.look.kid); if (!gran) return null;
    return { title: 'COLD SOUP', text: `${gran.name} has called the waiter over. She says the gazpacho is cold. It's gazpacho.`, choices: [
      { label: 'Explain gazpacho', fn() {
        if (chance(0.5)) { joy(10); return `She nods slowly. She does not accept it.`; }
        gran.happy -= 15; joy(15); return `"In MY day soup was HOT." She tells the whole table.`; } },
      { label: 'Microwave it', fn() { joy(20); gran.happy += 15; return `She declares it the best soup she's had since 1974.`; } },
    ] };
  } },
  { id: 'redwine', pool: 'dinner', cond: () => !G.groomStain, build() {
    return { title: 'RED ALERT', text: `Someone has knocked a full glass of red wine straight down ${gN()}'s beige waistcoat. It is now... a different beige.`, choices: [
      { label: 'White wine cancels it out!', fn() {
        if (chance(0.5)) { joy(20); return `It actually works! Science!`; }
        G.groomStain = true; joy(25); bliss(-3); return `It does not work. He now smells like a wine bar.`; } },
      { label: 'Wear it with pride', fn() { G.groomStain = true; joy(15); bliss(2); return `"It's a design feature." Nobody believes him but everyone respects it.`; } },
      { label: 'Swap waistcoats with the best man', fn() { joy(30); return `${G.bestMan.name} now wears the stain. As is his duty.`; } },
    ] };
  } },

  // ===================== RUSSIAN FAMILY =====================
  { id: 'gorko', pool: 'dinner', weight: 2.5, build() {
    const d = G.dmitri && G.dmitri.present ? G.dmitri : anyGuest();
    return { title: 'GORKO! GORKO!', text: `${d.name} stands, sips his vodka and pulls a face. "GORKO!" It's BITTER! By Russian tradition the newlyweds must kiss to sweeten it while the whole room counts. The chant is spreading: "GOR-KO! GOR-KO!"`, choices: [
      { label: 'A quick peck', fn() { joy(10); heartsAt(G.groom.x, G.groom.y, 4); later(25, () => { G.usedEvents.delete('gorko'); }); return `The count reaches "ODIN, DVA..." and stops. "BOOOO!" The Russian side demand a rematch later.`; } },
      { label: 'A long, proper kiss', fn() {
        const n = ri(12, 48); heartsAt(G.groom.x, G.groom.y, 16); bliss(5);
        if (n >= 30) { joy(n * 2); memory(`Gorko! Counted to ${n}`, 50); return `The room counts... ${n}! ${nameOr(G.dmitri, 'Uncle Dmitri')} is standing on his chair shouting the numbers.`; }
        joy(n + 15); return `They make it to ${n}. Respectable. Uncle Dmitri nods slowly.`; } },
      { label: `${gN()} dips ${bN()} for the record`, fn() {
        if (chance(0.6)) { joy(90); bliss(6); memory('Gorko record: 60!', 70); heartsAt(G.groom.x, G.groom.y, 20); return `SIXTY! A new family record. ${G.mob.name} is crying into her napkin.`; }
        joy(40); bliss(-3); return `He dips, wobbles and they both end up on the banquet carpet. The count carries on regardless.`; } },
    ] };
  } },
  { id: 'vodka', pool: 'dinner', cond: () => G.dmitri && G.dmitri.present, build() {
    return { title: 'ZA MOLODYKH!', text: `Uncle Dmitri has produced a crate of vodka "from home" and is pouring shots for every table. "To the newlyweds! ZA MOLODYKH!" The British side look nervous.`, choices: [
      { label: 'Everyone does a shot!', fn() {
        for (const p of guests()) if (alcoholOK(p)) { p.drunk += 18; p.happy += 5; }
        joy(50); memory('Vodka toast for the whole room', 40); addBuff('vodka', 'Na Zdorovye!', 60, 0.15);
        later(ri(70, 110), () => { const v = G.people.filter(p => p.present && p.kind === 'guest' && !p.russian && p.drunk > 25 && !p.look.kid).sort((a, b) => b.drunk - a.drunk)[0]; if (v) { queasy(v, 3); msg(v.name + ' is regretting the vodka. They look very green...', 'bad'); } });
        return `"NA ZDOROVYE!" Forty shots go down. Uncle Gerald asks for another. There may be consequences later.`; } },
      { label: 'Shots for the Russians only', fn() { for (const p of guests()) if (p.russian && alcoholOK(p)) p.drunk += 25; joy(25); return `The Russian side knock them back without blinking. The British side applaud politely.`; } },
      { label: 'Secretly swap it for water', fn() {
        if (chance(0.5)) { joy(20); return `Nobody notices. You are a genius. Uncle Dmitri says it's the smoothest vodka he's ever had.`; }
        const g = G.mob; if (g) g.happy -= 40; bliss(-6); joy(-10); return `${nameOr(G.mob, bN() + "'s mum")} takes one sip and slams the glass down. She KNOWS. She is furious.`; } },
    ] };
  } },
  { id: 'ransom', pool: 'party', weight: 1.5, build() {
    const d = G.dmitri && G.dmitri.present ? G.dmitri : (anyGuest(p => p.russian) || anyGuest());
    if (!d) return null;
    return { title: 'SHOE RANSOM', text: `${d.name} has stolen one of ${bN()}'s dark pink shoes. It's an old Russian tradition! He's waving it above the crowd and demanding a ransom from ${gN()}.`, choices: [
      { label: 'Pay the ransom (£100)', fn() { cash(-100); joy(20); bliss(3); return `${gN()} hands over a crumpled £100 "for the honeymoon fund". The shoe is returned with a bow.`; } },
      { label: `${gN()} sings for it`, fn() {
        if (chance(0.5)) { joy(55); memory(`${gN()} sang Kalinka for the shoe`, 40); return `He attempts "Kalinka" in very bad Russian. The Russian side are howling. Shoe returned!`; }
        joy(25); return `He sings Wonderwall. Dmitri is unmoved. He has to pay anyway.`; } },
      { label: 'Drink champagne from the shoe!', fn() {
        if (chance(0.6)) { joy(75); bliss(4); memory(`Champagne from ${bN()}'s shoe`, 60); return `${gN()} drinks champagne straight from the dark pink shoe. The Russian side erupt. ${nameOr(G.dmitri, 'Uncle Dmitri')} approves.`; }
        joy(50); bliss(-2); G.groomStain = true; return `The shoe leaks. Straight down the beige waistcoat. Still counts!`; } },
    ] };
  } },
  { id: 'korob', pool: 'party', weight: 1.5, cond: () => G.djOn, build() {
    const b = G.babushka && G.babushka.present ? G.babushka : null; if (!b) return null;
    return { title: 'KOROBEINIKI!', text: `${b.name} has marched up to the DJ and demanded a Russian folk song. The first notes of Korobeiniki ring out (yes, the Tetris music)... and it's getting faster... and FASTER...`, choices: [
      { label: 'Cossack dance-off!', fn() {
        G.musicOverride = { track: 'korob', until: G.time + 10, start: G.time };
        for (const p of guests()) if (['idle', 'chat', 'walk', 'watch'].includes(p.state) && chance(0.7)) { interrupt(p); goDance(p); }
        funAll(-35);
        if (chance(0.6)) { joy(70); memory('The Cossack squat-kick dance-off', 70); return `Squat, kick, squat, kick! Babushka Galina is out-kicking men half her age.`; }
        joy(40); if (G.gerald && G.gerald.present) fall(G.gerald); return `Uncle Gerald attempts a squat-kick. His knees make a noise like a bin lorry. He's down.`; } },
      { label: 'Everyone in a big circle!', fn() {
        G.musicOverride = { track: 'korob', until: G.time + 8, start: G.time };
        joy(45); bliss(4); funAll(-25); return `A huge circle dance, faster and faster, until someone flies out of the circle into the cake table.`; } },
      { label: 'Ask the DJ to play something else', fn() { b.happy -= 50; bliss(-5); return `Babushka Galina turns slowly to look at you. You will be hearing about this for years.`; } },
    ] };
  } },
  { id: 'contest', pool: 'party', cond: () => G.dmitri && G.dmitri.present && G.gerald && G.gerald.present && G.time > 1170, build() {
    const g = G.gerald, d = G.dmitri;
    return { title: 'UK vs RUSSIA', text: `${g.name} has challenged ${d.name} to a drinking contest. A crowd has gathered. Bets are being placed in two currencies.`, choices: [
      { label: `Back ${g.name}`, fn() {
        g.drunk = Math.min(100, g.drunk + 35); d.drunk = Math.min(100, d.drunk + 25);
        if (chance(0.3)) { joy(70); memory('Gerald beat Dmitri', 60); queasy(d, 2); return `Against all odds, Gerald wins! Dmitri congratulates him, then goes a funny colour.`; }
        joy(45); queasy(g, 2); return `Gerald lasts four rounds and turns green. Dmitri hasn't even taken his jacket off.`; } },
      { label: `Back ${d.name}`, fn() { g.drunk = Math.min(100, g.drunk + 35); d.drunk = Math.min(100, d.drunk + 20); joy(40); queasy(g, 3); memory('Dmitri drank Gerald under the table', 40); return `Dmitri wins easily. "In Russia, this is breakfast." Gerald is looking very pale.`; } },
      { label: 'Shut it down', fn() { joy(5); g.happy -= 15; d.happy -= 15; return `Boos from both sides. International relations have suffered.`; } },
    ] };
  } },
  // ===================== EVENING / PARTY =====================
  { id: 'power', pool: 'party', cond: () => G.powerOut <= 0, build() {
    return { title: 'POWER CUT!', text: `BZZT. The lights go out and the music dies. Somebody screams. Somebody else laughs nervously.`, choices: [
      { label: 'Acoustic singalong', fn() {
        G.powerOut = 15;
        if (chance(0.6)) { joy(50); funAll(-30); memory('The candlelit singalong', 50); return `Uncle Gerald produces a guitar from nowhere. Wonderwall has never sounded better.`; }
        joy(20); return `The guitar only has two strings. It's still oddly moving.`; } },
      { label: 'Phone torch rave!', fn() { G.powerOut = 15; joy(40); funAll(-25); memory('The phone torch rave', 40); return `Forty phone torches waving in the dark. It's like Ibiza, if Ibiza was in a barn.`; } },
      { label: 'Wait for the electrician', fn() { G.powerOut = 25; joy(-10); funAll(25); return `Twenty-five minutes of awkward small talk in the dark.`; } },
    ] };
  } },
  { id: 'ex', pool: 'party', build() {
    return { title: 'UH OH', text: `An ex has turned up "just to drop off a card". They are wearing white. The room has gone very quiet.`, choices: [
      { label: hasBouncer() ? 'Bouncer!' : 'Bouncer! (you have none)', fn() {
        if (hasBouncer()) { joy(20); bliss(3); return `Escorted out, card and all. The music comes back up.`; }
        bliss(-8); return `No bouncer. They stay for "one drink". It's three.`; } },
      { label: 'Welcome them in', fn() {
        if (chance(0.5)) { joy(30); return `They have a lovely time, dance with the aunties and leave at ten. Very mature.`; }
        bliss(-8); joy(10);
        later(ri(20, 45), () => { const a = anyGuest(p => p.drunk > 30 && ['idle', 'dance', 'chat'].includes(p.state)); const b = a && anyGuest(q => q !== a && ['idle', 'dance', 'chat'].includes(q.state)); if (a && b) { msg('The ex drama has boiled over...', 'bad'); startFight(a, b); } });
        return `Drama. Tears in the toilets. Everyone has an opinion. This isn't over.`; } },
      { label: 'Throw the bouquet at them', fn() { joy(25); bliss(2); return `It hits them square in the face. Message received.`; } },
    ] };
  } },
  { id: 'proposal', pool: 'party', build() {
    const a = anyGuest(), b = anyGuest(p => p !== a); if (!a || !b) return null;
    return { title: 'WILL YOU...?', text: `${a.name} has dropped to one knee on the dance floor in front of ${b.name}. At YOUR wedding.`, choices: [
      { label: 'Let it happen', fn() {
        if (chance(0.5)) { joy(60); bliss(-5); memory('A proposal at the wedding!', 50); return `They say YES! The room erupts. ${bN()} smiles through gritted teeth.`; }
        joy(30); return `"Can we... talk about this outside?" Ouch.`; } },
      { label: 'DJ, play the Benny Hill music', fn() { joy(40); memory('The Benny Hill proposal', 30); return `The moment is ruined. Everyone is crying with laughter, including them.`; } },
      { label: 'Start a conga to block it', fn() { startConga(); joy(30); return `Da-da-da-da-da-HEY! The proposal is swept away in a tide of conga.`; } },
    ] };
  } },
  { id: 'firealarm', pool: 'party', cond: () => G.djHired, build() {
    return { title: 'FIRE ALARM!', text: `The DJ's smoke machine has set off the fire alarm. Everyone has to go outside. The fire brigade is on its way.`, choices: [
      { label: 'Everyone out!', fn() {
        for (const p of guests()) if (!['use', 'fight', 'sleep', 'leave', 'fallen'].includes(p.state)) { interrupt(p); goWatch(p, 'lawn'); }
        if (chance(0.5)) { joy(50); memory('The firefighter YMCA', 50); return `The firefighters are a massive hit. One of them does the YMCA.`; }
        joy(15); return `A chilly ten minutes on the lawn. An auntie wraps herself in a tablecloth.`; } },
      { label: 'Hit the button and hope', fn() {
        if (chance(0.5)) { joy(10); return `Silence. Nobody saw anything.`; }
        moodAll(-15); messNear('spill', 19, 15, 6, 4); return `The sprinklers come on. Indoors. Hair and make-up: destroyed.`; } },
    ] };
  } },
  { id: 'danceoff', pool: 'party', build() {
    const gran = anyGuest(p => !p.look.kid); const y = anyGuest(p => p !== gran); if (!gran || !y) return null;
    return { title: 'DANCE-OFF!', text: `${gran.name} has challenged ${y.name} to a dance-off. A circle has formed. Somebody's filming.`, choices: [
      { label: `Back ${gran.name.split(' ')[0]}!`, fn() {
        if (chance(0.6)) { joy(55); memory(`${gran.name}'s legendary headspin`, 60); return `${gran.name} does a headspin. Nobody knew. NOBODY KNEW.`; }
        joy(25); return `${gran.name} pulls something but finishes with a dignified point to the crowd.`; } },
      { label: `Back ${y.name}`, fn() {
        if (chance(0.4)) { joy(35); return `${y.name} wins with a worm across the whole floor.`; }
        joy(20); return `${y.name} slips and lands in the splits. ${gran.name} wins by default.`; } },
      { label: 'Everybody in!', fn() { joy(35); funAll(-30); for (const p of guests()) if (p.state === 'idle' && chance(0.6)) goDance(p); return `Total mayhem. The best kind.`; } },
    ] };
  } },
  { id: 'mic', pool: 'party', build() {
    const u = G.gerald && G.gerald.present ? G.gerald : anyGuest(p => p.look.sex === 'm'); if (!u) return null;
    return { title: 'MIC DROP', text: `${u.name} has commandeered the DJ's microphone. He's going to say "a few words". He is very, very drunk.`, choices: [
      { label: 'Let him', fn() {
        if (chance(0.4)) { joy(50); bliss(3); memory(`${u.name}'s surprisingly moving speech`, 40); return `It's... actually lovely? There are tears.`; }
        joy(15); funAll(10); return `It's a 20 minute story about his divorce. It has no ending.`; } },
      { label: 'Cut the mic', fn() { joy(10); u.happy -= 25; return `He carries on without it. Louder.`; } },
      { label: `${gN()} joins for a duet`, fn() {
        if (chance(0.5)) { joy(45); memory('The Bohemian Rhapsody duet', 50); return `Bohemian Rhapsody. Full operatic section. Standing ovation.`; }
        joy(25); return `They forget every word after "Is this the real life". Doesn't matter.`; } },
    ] };
  } },
  { id: 'hen', pool: 'party', weight: () => G.omens.has('hen') ? 4 : 1, build() {
    return { title: 'HEN PARTY', text: `A hen do from the venue next door has spotted your dance floor. Eight women in pink sashes are at the gate, chanting.`, choices: [
      { label: 'Let them in!', fn() { spawnHens(6); joy(40); return `The dance floor has never been busier. Neither has the bar.`; } },
      { label: hasBouncer() ? 'Bouncer, no!' : 'Bouncer! (you have none)', fn() {
        if (hasBouncer()) { joy(5); return `Politely turned away. They do a lap of the car park and leave.`; }
        spawnHens(6); joy(20); return `With no bouncer, they just... walk in. Fair enough.`; } },
      { label: 'Charge them £20 each', fn() { spawnHens(6); cash(120); joy(20); return `Business is business. They pay and storm the dance floor.`; } },
    ] };
  } },
  { id: 'kebab', pool: 'party', cond: () => G.time > 1260, build() {
    return { title: 'KEBAB VAN', text: `A kebab van has pulled up outside the gate. The smell is drifting onto the dance floor. Guests are getting twitchy.`, choices: [
      { label: 'Buy everyone chips (£200)', fn() { cash(-200); for (const p of guests()) p.needs.hunger = Math.max(0, p.needs.hunger - 50); joy(50); memory('Chips for everyone!', 40); return `Hero. Absolute hero. ${gN()} eats his in his waistcoat.`; } },
      { label: 'Let them buy their own', fn() { for (const p of guests()) if (chance(0.5)) p.needs.hunger = Math.max(0, p.needs.hunger - 40); joy(15); return `A queue forms instantly. Garlic sauce gets everywhere.`; } },
      { label: 'Send it away', fn() { joy(-10); moodAll(-5); return `A collective groan goes up from the dance floor.`; } },
    ] };
  } },
  { id: 'sprinkler', pool: 'party', cond: () => guests().some(p => isOutdoor(Math.floor(p.x), Math.floor(p.y))), build() {
    return { title: 'SPRINKLERS!', text: `The garden sprinklers have switched themselves on. Several guests on the lawn are getting drenched.`, choices: [
      { label: 'Run inside!', fn() { joy(5); for (const p of guests()) if (isOutdoor(Math.floor(p.x), Math.floor(p.y)) && ['idle', 'walk', 'chat'].includes(p.state)) { interrupt(p); wander(p, 'hall'); } return `A squelchy retreat to the hall.`; } },
      { label: 'Sprinkler dance party!', fn() {
        if (chance(0.6)) { joy(40); memory('The sprinkler dance party', 40); return `Everyone outside does the sprinkler. Literally. In the sprinklers.`; }
        moodAll(-5); messNear('mud', 6, 16, 5, 4); return `It turns into a mud bath. The hall is getting muddy footprints.`; } },
    ] };
  } },
  { id: 'chant', pool: 'party', build() {
    return { title: 'THE CHANT', text: `${gN()}'s mates have started a chant. "He's ginger, he's lovely, he's wearing green..." It's getting louder.`, choices: [
      { label: 'Join in', fn() { joy(30); bliss(2); return `The whole room is singing it. ${gN()} does a lap of honour.`; } },
      { label: `${gN()} crowd-surfs`, fn() {
        if (chance(0.55)) { joy(60); memory('The groom crowd-surfed', 50); return `Carried across the room like a ginger king. Glorious.`; }
        joy(30); bliss(-3); return `They drop him. Into the buffet. He's fine. The buffet isn't.`; } },
    ] };
  } },
];

// ---------- variant helpers (replay variety) ----------
// Is this character actually at the wedding right now?
function isHere(p) { return !!(p && p.present && !p.gone && p.state !== 'leave'); }
// Their name if present, otherwise a fallback.
function nameOr(p, fb) { return isHere(p) ? p.name : fb; }
function byRole(role) { return G.people.find(p => p.role === role && isHere(p)) || null; }
function lastWord(s) { const w = String(s || '').trim().split(/\s+/); return w.length > 1 ? w[w.length - 1] : ''; }
function guestList() { return (typeof window !== 'undefined' && window.GUEST_LIST) || {}; }
// Pick one of several versions of a scripted event. Recently seen versions
// (on previous days) are heavily down-weighted so replays rarely repeat.
// variants: [{ id, weight? (number|fn), cond?, build() }]
function pickVariant(key, variants) {
  const pool = variants.filter(v => !v.cond || v.cond());
  while (pool.length) {
    const w = (v) => Math.max(0, typeof v.weight === 'function' ? v.weight() : (v.weight == null ? 1 : v.weight));
    const v = weighted(pool.map(x => [x, w(x) * recency(key + ':' + x.id)])) || pool[0];
    const ev = v.build();
    if (ev) { markSeen(key + ':' + v.id); ev.variant = v.id; return ev; }
    pool.splice(pool.indexOf(v), 1);
  }
  return null;
}
// Run `f` (shared behaviour) before any variant-specific after().
function withAfter(ev, f) { const a = ev.after; ev.after = function () { f(); if (a) a(); }; return ev; }

// ---------- scripted events ----------
function evKaravai() {
  const mob = G.mob, fob = G.fob, b = G.babushka, d = G.dmitri;
  const parents = isHere(mob) && isHere(fob) ? `${mob.name} and ${fob.name}` : isHere(mob) ? mob.name : isHere(fob) ? fob.name : `${bN()}'s family`;
  return pickVariant('karavai', [
    { id: 'bite', build() {
      return { title: 'BREAD & SALT', text: `${parents} greet the newlyweds with an enormous karavai loaf on an embroidered towel, with a little dish of salt on top. Tradition says whoever takes the BIGGEST bite will be head of the household...`, choices: [
        { label: `${gN()} goes for a massive bite`, fn() {
          if (chance(0.5)) { joy(45); memory(`${gN()} won the karavai`, 40); return pick([`He unhinges his jaw like a python. Head of the household! The Russian side cheer "MOLODETS!"`, `He takes a bite the size of a hubcap. ${nameOr(fob, 'Her dad')} slaps him on the back so hard he nearly swallows it whole.`]); }
          joy(35); bliss(3); return `He gets a mouthful of salt and starts coughing. ${bN()} takes a dainty bite and wins anyway.`; } },
        { label: `${bN()} goes for a massive bite`, fn() { joy(50); bliss(5); memory(`${bN()} won the karavai`, 40); return `${bN()} takes half the loaf. Nobody argues. ${nameOr(mob, 'Her mum')} weeps with pride.`; } },
        { label: 'Share it, dipped in salt', fn() { joy(25); bliss(8); if (isHere(b)) { b.happy += 20; return `${b.name} nods approvingly. From her, that's a standing ovation.`; } return `A sweet, sensible start to married life. The Russian aunties approve.`; } },
      ] };
    } },
    { id: 'towel', build() {
      return { title: 'THE RUSHNYK RACE', text: `${parents} have laid an embroidered rushnyk towel across the path. Old tradition: whoever steps onto it FIRST will rule the household. ${gN()} and ${bN()} eye each other. Somebody whispers "ready... steady..."`, choices: [
        { label: `${gN()} sprints for it`, fn() {
          if (chance(0.5)) { joy(45); memory(`${gN()} won the towel race`, 30); return `He goes off like a greyhound and lands on it with both feet. The Russian side are impressed. ${bN()} is plotting revenge.`; }
          joy(40); bliss(-2); return `He slips on the towel and slides the full length of the path like a ginger bowling ball. ${bN()} steps onto it serenely. Game over.`; } },
        { label: `${bN()} steps on it gracefully`, fn() { joy(35); bliss(6); return pick([`One elegant dark pink shoe, placed just so. ${gN()} didn't even see her move. The aunties nod: "Correct result."`, `She steps on it while ${gN()} is still asking what the rules are. Head of the household before he's finished his question.`]); } },
        { label: 'Jump on together', fn() { joy(30); bliss(8); heartsAt(G.bride.x, G.bride.y, 8); return isHere(b) ? `They land together, holding hands. ${b.name} declares it a draw, which apparently means SHE is in charge.` : `They land together, holding hands. A draw! The aunties say that means a happy marriage.`; } },
      ] };
    } },
    { id: 'glasses', build() {
      const host = isHere(d) ? d.name : isHere(fob) ? fob.name : `${bN()}'s uncle`;
      return { title: 'SMASH FOR LUCK!', text: `${host} hands the newlyweds a glass of champagne each. "Drink, and then SMASH! The more pieces, the more happy years!" The venue manager has gone very, very pale.`, choices: [
        { label: 'Drink and SMASH!', fn() {
          messNear('litter', 6, 13, 4, 2);
          const n = ri(9, 70);
          if (n > 30) { joy(55); memory(`${n} pieces of good luck`, 30); return `SMASH! The aunties count the shards: ${n}! That's ${n} happy years. The venue manager adds it to the bill.`; }
          joy(35); return `SMASH! Only ${n} pieces. "Is fine, is fine," says ${host}, quietly sweeping a few extra ones off the table for luck.`; } },
        { label: 'Use plastic flutes, for safety', fn() {
          if (chance(0.5)) { joy(15); return `They bounce. The British side applaud. The Russian side look at each other darkly.`; }
          joy(5); bliss(-3); return `The flutes bounce, and ${isHere(b) ? b.name : 'an auntie'} mutters that bouncing glasses are "very bad luck". She will be mentioning this at every anniversary.`; } },
        { label: 'Lob them over their shoulders', fn() {
          if (chance(0.5)) { joy(45); messNear('litter', 4, 14, 2, 2); return `Two perfect arcs into the flowerbed. Satisfying smash. Cheers all round.`; }
          joy(30); if (isHere(G.gerald)) G.gerald.happy -= 15; return `${gN()}'s glass flies straight into ${nameOr(G.gerald, 'an uncle')}'s pint. Two glasses, one smash. That has to count double.`; } },
      ] };
    } },
    { id: 'giant', cond: () => isHere(b), build() {
      return { title: 'THE GIANT KARAVAI', text: `${b.name} has baked the karavai herself. It is the size of a tractor tyre, covered in dough birds and wheat sheaves, with two little dough figures on top that look suspiciously like ${gN()} and ${bN()}.`, choices: [
        { label: 'Both bite at the same time', fn() { joy(40); bliss(6); heartsAt(G.groom.x, G.groom.y, 8); return `They bite at the same time and end up nose to nose in the bread. ${b.name} takes this as a sign of a long marriage.`; } },
        { label: 'Share it with all the guests', fn() { for (const p of guests()) p.needs.hunger = Math.max(0, p.needs.hunger - 30); b.happy += 15; joy(40); return `It feeds the entire garden, with some left over for the goat next door. ${b.name} is quietly delighted everyone is eating.`; } },
        { label: `${bN()} bites the dough ${gN()}'s head off`, fn() {
          if (chance(0.6)) { joy(55); memory(`${bN()} ate the dough groom`, 30); return `Chomp. Headless dough groom. The Russian side roar with approval. The British side are slightly concerned for the real one.`; }
          joy(20); bliss(-2); b.happy -= 10; return `It's rock solid. ${bN()} nearly loses a tooth. ${b.name} says it "needed another hour".`; } },
      ] };
    } },
  ]);
}

function cakeAfter() { G.cakeCut = true; G.cakeDone = true; G.groom.state = 'idle'; G.bride.state = 'idle'; confettiAt(26, 3, 30); msg('The cake is cut! Guests can now grab a slice.', 'good'); }
function evCake() {
  const d = G.dmitri;
  const ev = pickVariant('cake', [
    { id: 'classic', build() {
      return { title: 'CUTTING THE CAKE', text: `Three tiers of lemon sponge with dark pink sugar roses. Knife in hand, ${gN()} and ${bN()} pose for the photographer...`, choices: [
        { label: 'A classic, careful slice', fn() { joy(30); bliss(3); return pick([`Perfect. Click. Applause. Cake for everyone!`, `A neat, steady cut. The photographer gets the shot. ${bN()}'s mum gets eleven more on her phone.`]); } },
        { label: `Smash it in each other's faces`, fn() {
          if (chance(0.5)) { joy(70); bliss(3); memory('Cake to the face', 50); return `SPLAT. Both of them. The crowd goes absolutely feral.`; }
          joy(40); bliss(-10); return `${bN()} did NOT agree to this. Her make-up artist is weeping.`; } },
        { label: isHere(G.gran) ? `Let ${G.gran.name} cut it with Grandad's sword` : `Let the eldest guest cut it with a sword`, fn() {
          if (chance(0.5)) { joy(80); memory('The sword cake-cutting', 60); return `One clean swipe. ${nameOr(G.gran, 'The old dear')} is a legend. Nobody knew she could do that.`; }
          joy(40); G.cakeSlices = 25; spawnMess('cake', 26.5, 3.5); return `Half the cake ends up on the floor. Five-second rule!`; } },
      ] };
    } },
    { id: 'sabre', cond: () => isHere(d), build() {
      return { title: 'THE COSSACK SABRE', text: `${d.name} pushes through the crowd holding a gleaming Cossack sabre. "A KNIFE? For a wedding cake? Nyet. We use THIS." Nobody knows where he has been keeping it all day.`, choices: [
        { label: 'The couple cut it with the sabre', fn() {
          if (chance(0.5)) { joy(90); bliss(3); memory('The sabre-cut cake', 60); return `One swish. Three perfect tiers, sliced clean. ${d.name} wipes a tear away. "Like my wedding. But nobody got hurt."`; }
          joy(35); G.cakeSlices = 30; spawnMess('cake', 26.5, 3.5); return `It goes through the cake, the stand, and slightly into the table. Thirty slices survive. ${d.name} applauds anyway.`; } },
        { label: `Let ${d.name} do it`, fn() { joy(60); d.happy += 20; return pick([`He spins, shouts something in Russian and slices the top tier into exactly sixteen pieces. Then bows. The kids want lessons.`, `He takes it very seriously: a salute, a stance, a deep breath, one perfect cut. The British side give him a standing ovation.`]); } },
        { label: 'Use the normal knife, thanks', fn() { joy(15); bliss(2); d.happy -= 20; return `${d.name} lowers the sabre sadly and sulks into his vodka. The cake is cut safely. Boringly, but safely.`; } },
      ] };
    } },
    { id: 'leaning', build() {
      const why = G.weather === 'Scorching' ? 'The heat has' : 'A wobbly table leg has';
      return { title: 'THE LEANING CAKE', text: `${why} got to the cake. All three tiers are leaning like a very sweet Tower of Pisa, and the top tier is very slowly sliding towards the floor.`, choices: [
        { label: 'Cut it FAST!', fn() {
          if (chance(0.55)) { joy(50); return `Lightning reflexes! They cut and catch the top tier in one move. The photographer got it mid-air.`; }
          joy(30); bliss(-4); G.cakeSlices = 30; spawnMess('cake', 26.5, 3.5); return `The top tier makes a break for it and lands face-down on the carpet. The kids are on it like seagulls.`; } },
        { label: 'Prop it up with bread rolls', fn() { joy(25); bliss(2); return `Engineering! Four bread rolls and a napkin hold it level. Nobody looks too closely at the photos.`; } },
        { label: 'Pose holding it up, like Pisa', fn() { joy(45); bliss(2); memory('The Leaning Cake of Pisa', 30); return `Every guest queues up to do the "holding it up" photo. It's the most popular cake of all time.`; } },
      ] };
    } },
    { id: 'topper', build() {
      const lookalike = nameOr(G.gerald, nameOr(G.dmitri, 'the registrar'));
      return { title: 'THE CAKE TOPPER', text: `The baker has made a custom cake topper of the couple. Unfortunately the little groom has jet-black hair and a moustache, and the little bride looks uncannily like ${lookalike}.`, choices: [
        { label: 'Laugh it off and cut', fn() { joy(35); bliss(2); return `"Who is that man and why is he marrying ${lookalike}?" The photos are going to be a talking point for decades.`; } },
        { label: 'Give it ginger icing hair', fn() {
          if (chance(0.6)) { joy(45); memory('The ginger-iced cake topper', 30); return `A dab of orange icing and it's ${gN()} to the life. The moustache stays. Everyone agrees it suits him.`; }
          joy(20); return `Too much orange. The little groom now looks like he's on fire. ${gN()} says it's "pretty accurate after the stag do".`; } },
        { label: 'Demand a refund (+£50)', fn() { cash(50); joy(5); bliss(-2); return `The baker refunds £50 and takes the topper away. The cake now looks oddly bald.`; } },
      ] };
    } },
    { id: 'auction', cond: () => isHere(G.mob) || isHere(d), build() {
      const host = nameOr(G.mob, d.name);
      const bidA = nameOr(d, nameOr(G.fob, 'a Russian uncle')), bidB = nameOr(G.gerald, nameOr(G.gdad, 'an English uncle'));
      return { title: 'THE CAKE AUCTION', text: `${host} announces an old family custom: the first slice of cake goes to the highest bidder, and the money goes to the newlyweds. ${bidA} already has his wallet out.`, choices: [
        { label: 'Start the bidding!', fn() {
          const amt = ri(8, 30) * 10; cash(amt);
          if (amt >= 200) { joy(55); memory(`The £${amt} slice of cake`, 40); return `A bidding war between ${bidA} and ${bidB} gets completely out of hand. It goes for £${amt}! For one slice. With a sugar rose.`; }
          joy(35); return `${bidA} wins the first slice for £${amt}, then eats it in one bite while maintaining eye contact with ${bidB}.`; } },
        { label: 'First slices to the parents', fn() { joy(30); bliss(6); return `${gN()} and ${bN()} hand the first slices to both sets of parents. ${nameOr(G.gmum, 'His mum')} and ${nameOr(G.mob, 'her mum')} both cry. Competitively.`; } },
        { label: 'Feed each other instead', fn() {
          if (chance(0.6)) { joy(40); bliss(5); heartsAt(26, 3, 10); return `A sweet, careful forkful each. Aww. The auction is quietly forgotten.`; }
          joy(50); bliss(-6); return `${gN()} goes for the "playful nose dab". It becomes a full face. ${bN()} retaliates. Nobody bids after that.`; } },
      ] };
    } },
  ]);
  return withAfter(ev, cakeAfter);
}

function evNoCake() {
  const b = G.babushka;
  return pickVariant('nocake', [
    { id: 'classic', build() {
      return { title: 'NO CAKE?!', text: `It's time to cut the cake... except the goat ate it. ${bN()} is staring at an empty cake stand covered in crumbs and hoof prints.`, choices: [
        { label: 'Emergency supermarket cake (£150)', fn() { cash(-150); G.cakeEaten = false; G.cakeCut = true; G.cakeSlices = 35; joy(30); bliss(8); return `A Colin the Caterpillar arrives in a taxi. ${gN()} and ${bN()} cut it like it's a five-tier masterpiece.`; } },
        { label: 'Ask the chef for a giant pavlova (£80)', fn() { cash(-80); G.cakeEaten = false; G.cakeCut = true; G.cakeSlices = 25; joy(20); bliss(4); return `A giant pavlova appears. Not a wedding cake, but nobody's complaining.`; } },
        { label: 'Laugh it off', fn() { if (chance(0.5)) { joy(40); bliss(3); memory('The cake that the goat ate', 30); return `${gN()} gives a speech about "the goat who loved us too much". Huge laughs.`; } bliss(-6); return `${bN()} is not laughing. Not yet. Maybe in about ten years.`; } },
      ] };
    } },
    { id: 'medovik', cond: () => isHere(b), build() {
      return { title: 'NO CAKE?!', text: `The cake is gone. Eaten. By a goat. ${bN()} is close to tears... but ${b.name} is calmly opening a cool box. "I knew," she says. "I always know." Inside: a twelve-layer medovik honey cake.`, choices: [
        { label: 'Cut the medovik!', fn() { G.cakeEaten = false; G.cakeCut = true; G.cakeSlices = 40; b.happy += 20; joy(60); bliss(8); memory(`${b.name}'s emergency medovik`, 50); return `Twelve layers of honey and cream. The British side have never tasted anything like it. ${b.name} accepts the applause with a tiny nod.`; } },
        { label: 'Medovik AND a supermarket cake (£120)', fn() { cash(-120); G.cakeEaten = false; G.cakeCut = true; G.cakeSlices = 50; joy(55); bliss(5); return `Two cakes! The medovik vanishes in ten minutes. The supermarket one is still there at midnight. ${b.name} looks smug.`; } },
        { label: 'Politely decline it', fn() { b.happy -= 40; bliss(-8); joy(-20); return `You turn down a babushka's cake. On her granddaughter's wedding day. ${b.name} closes the cool box very, very slowly.`; } },
      ] };
    } },
    { id: 'whipround', build() {
      return { title: 'THE CAKE FUND', text: `There is no cake: the goat has had it. ${bN()} looks devastated. ${gN()}'s mates are already passing a pint glass round "for the cake fund". It's filling up with coins, a fiver and a button.`, choices: [
        { label: 'Use the whip-round for a cake', fn() {
          const raised = ri(50, 170); cash(raised - 120); G.cakeEaten = false; G.cakeCut = true; G.cakeSlices = 30; joy(40); bliss(5);
          return raised >= 120 ? `The guests raise £${raised}! A bakery cake arrives within the hour and there's change for the bar. ${bN()} is touched.` : `The glass raises £${raised}. You cover the rest. A bakery cake arrives, and the button is returned to its owner.`; } },
        { label: 'Cheese tower instead (£90)', fn() { cash(-90); G.cakeEaten = false; G.cakeCut = true; G.cakeSlices = 30; joy(35); bliss(3); return `A three-tier tower of cheddar, brie and stilton. Honestly? Half the guests prefer it. ${gN()} cuts it with a cheese wire.`; } },
        { label: 'Ceremonially cut the crumbs', fn() {
          if (chance(0.5)) { joy(45); memory('Cutting the crumbs', 30); return `They solemnly "cut" a single crumb with the big knife. The photographer plays along. It's the funniest picture of the day.`; }
          joy(5); bliss(-6); return `The joke doesn't land. ${bN()} wanted cake, not crumbs.`; } },
      ] };
    } },
  ]);
}

function firstDanceAfter() {
  G.firstDanceDone = true;
  for (const c of [G.groom, G.bride]) { c.state = 'dance'; c.danceSpeed = 3; c.timer = 10; c.onTimer = (q) => { q.state = 'idle'; q.idleT = 0; }; }
}
const FD_SONGS = [
  { t: 'Perfect (Ed Sheeran, obviously)', fn() { joy(35); bliss(8); heartsAt(19.5, 16.5, 14); return pick([`Every ginger man's anthem. Gentle swaying, foreheads together. Lovely.`, `${gN()} mouths every word to ${bN()}. She pretends to be embarrassed. She isn't.`]); } },
  { t: '(I\'ve Had) The Time of My Life', fn() {
    if (chance(0.35)) { joy(150); bliss(10); memory('THE LIFT', 120); confettiAt(19.5, 16.5, 60); heartsAt(19.5, 16.5, 20); return `Nobody puts ${bN()} in a corner. PERFECT LIFT. People are standing on chairs.`; }
    joy(55); bliss(-5); memory('The lift that became a fireman\'s carry', 50); return `The lift turns into more of a fireman's carry. ${bN()} is laughing too hard to be cross. Just.`; } },
  { t: 'Kalinka (it gets faster)', fn() {
    if (G.djOn) G.musicOverride = { track: 'korob', until: G.time + 8, start: G.time };
    for (const p of guests()) if (p.russian && ['idle', 'chat', 'walk', 'watch'].includes(p.state) && chance(0.7)) { interrupt(p); goDance(p); }
    if (chance(0.65)) { joy(70); bliss(5); memory('The Kalinka first dance', 50); return `Slow... slow... then KALINKA-KALINKA at double speed. The Russian side flood the floor. ${gN()} attempts a squat-kick and lands it!`; }
    joy(35); return `It gets faster and faster until ${gN()} spins ${bN()} straight into the DJ booth. Both fine. DJ less so.`; } },
  { t: 'Can\'t Help Falling in Love', fn() { joy(40); bliss(10); heartsAt(19.5, 16.5, 16); return `Slow, simple, perfect. ${nameOr(G.mob, 'Her mum')} and ${nameOr(G.gmum, 'his mum')} are holding hands and sobbing.`; } },
  { t: 'Dancing Queen (everybody up!)', fn() {
    for (const p of guests()) if (['idle', 'chat', 'walk', 'watch'].includes(p.state) && chance(0.6)) { interrupt(p); goDance(p); }
    funAll(-25); joy(50); bliss(2); return `Within eight seconds the whole room is on the floor. It's less a first dance, more a first stampede.`; } },
  { t: 'Bohemian Rhapsody (all six minutes)', fn() {
    if (chance(0.5)) { joy(90); memory('The Bohemian Rhapsody first dance', 50); return `Ballad bit: romantic. Opera bit: the whole room does the voices. Headbang bit: ${gN()} nearly loses his quiff. Iconic.`; }
    joy(20); funAll(15); return `They run out of moves around "Galileo". The last three minutes are mostly shuffling.`; } },
  { t: 'Mr Brightside', fn() { for (const p of guests()) if (!p.look.kid && ['idle', 'chat', 'walk'].includes(p.state) && chance(0.5)) { interrupt(p); goDance(p); } funAll(-20); joy(55); return `"COMING OUT OF MY CAGE..." Forty men in suits appear from nowhere, arms round each other, screaming every word.`; } },
  { t: 'The Macarena (ironically)', fn() {
    if (chance(0.5)) { joy(60); memory('The Macarena first dance', 30); return `Perfectly deadpan, perfectly in sync. The room is in hysterics. Even ${nameOr(G.babushka, 'the oldest auntie')} does the hip bit.`; }
    joy(15); bliss(-4); return `It wasn't quite ironic enough. ${nameOr(G.mob, 'Her mum')} is appalled. "In Russia we would never."`; } },
];
function evFirstDance() {
  const nodj = !G.djOn, b = G.babushka, d = G.dmitri;
  const kids = guests().filter(p => p.look.kid);
  const ev = pickVariant('fd', [
    { id: 'classic', build() {
      return { title: 'THE FIRST DANCE', text: `${gN()} and ${bN()} take the floor. The lights dim. ${nodj ? "There's no DJ, so someone's playing it off their phone... " : ''}What's the plan?`, choices: [
        { label: 'Slow romantic ballad', fn() { joy(nodj ? 25 : 40); bliss(8); heartsAt(19.5, 16.5, 16); return `Swaying gently. ${bN()}'s dark pink shoes peek out with every turn. Not a dry eye in the house.`; } },
        { label: 'Surprise choreographed routine', fn() {
          if (chance(nodj ? 0.5 : 0.65)) { joy(100); bliss(8); memory('The surprise dance routine', 80); confettiAt(19.5, 16.5, 40); return `Halfway through, the music scratches into a full routine. The room LOSES IT.`; }
          joy(50); memory('The split trousers', 50); return `${gN()} attempts the splits. His green trousers do not survive.`; } },
        { label: 'The Dirty Dancing lift', fn() {
          if (chance(0.35)) { joy(150); bliss(10); memory('THE LIFT', 120); confettiAt(19.5, 16.5, 60); heartsAt(19.5, 16.5, 20); return `Nobody puts ${bN()} in a corner. PERFECT LIFT. People are standing on chairs.`; }
          joy(60); bliss(-5); memory('Cake-tastrophe', 60); spawnMess('cake', 19.5, 15.5); return `The lift becomes a fall. Somehow, into what's left of the cake.`; } },
      ] };
    } },
    { id: 'playlist', build() {
      const songs = shuffle(FD_SONGS.slice()).slice(0, 3);
      return { title: 'THE FIRST DANCE', text: `${gN()} and ${bN()} take the floor and the lights dim. Small problem: they never actually agreed on a song. ${nodj ? 'With no DJ, ' + bN() + ' has her phone out' : 'The DJ looks at them expectantly'}. Three songs are in the running...`, choices: songs.map(s => ({ label: s.t, fn: s.fn })) };
    } },
    { id: 'powercut', cond: () => !nodj, build() {
      const ch = [
        { label: 'Keep dancing in the dark', fn() { G.powerOut = ri(5, 9); joy(50); bliss(8); heartsAt(19.5, 16.5, 12); memory('Dancing in the dark', 40); return `They don't stop. One by one, forty phone torches come on around the floor like stars. It's ridiculously romantic.`; } },
        { label: 'Get the guests to sing it', fn() {
          G.powerOut = ri(5, 9);
          if (chance(0.6)) { joy(70); bliss(5); memory('The whole room sang the first dance', 50); return `The whole room picks up the song where the speakers left off. Eighty people, slightly out of tune, singing them round the floor.`; }
          joy(30); return `Nobody knows the second verse. It becomes humming. Then it becomes Wonderwall. They keep dancing anyway.`; } },
        { label: 'Wait for the power to come back', fn() { G.powerOut = ri(8, 12); joy(5); bliss(-3); funAll(15); return `They stand in the dark holding hands for ten minutes. Romantic for one minute. Awkward for nine.`; } },
      ];
      if (isHere(d)) ch.push({ label: `${d.name} gets his accordion out`, fn() { G.powerOut = ri(5, 9); joy(65); bliss(4); d.happy += 15; memory(`${d.name}'s accordion first dance`, 40); return `Nobody knew he had an accordion. He's apparently been carrying it all day "just in case". He plays them a Russian waltz in the dark. Magic.`; } });
      return { title: 'THE FIRST DANCE... BZZT', text: `The first notes of their song float out. ${gN()} takes ${bN()}'s hand. Twenty seconds in... BZZT. The power cuts out. Total darkness. Total silence.`, choices: ch };
    } },
    { id: 'babushka', cond: () => isHere(b), build() {
      const ch = [
        { label: 'Let her cut in', fn() {
          if (!nodj) G.musicOverride = { track: 'korob', until: G.time + 8, start: G.time };
          b.happy += 25; joy(60); memory(`${b.name} stole the first dance`, 50);
          return `She leads. Firmly. ${gN()} is spun like a top. Halfway through she clicks her fingers at the DJ and it turns into Korobeiniki. ${gN()} survives. Just.`; } },
        { label: 'Politely say "after this one"', fn() {
          if (chance(0.5)) { joy(20); bliss(4); return `She nods and steps back to the edge of the floor, where she watches them, unblinking, for the rest of the song. Then she claims ${gN()} for the next three.`; }
          b.happy -= 30; joy(-10); bliss(-5); return `"After this one?" She repeats it slowly, as if learning a new and disappointing English phrase. She sits down and does not clap.`; } },
      ];
      if (isHere(G.fob)) ch.splice(1, 0, { label: `Swap: ${bN()} dances with ${G.fob.name}`, fn() { joy(50); bliss(7); heartsAt(19.5, 16.5, 14); return `Partner swap! ${bN()} dances with her dad while ${gN()} is whirled round by ${b.name}. ${G.fob.name} is pretending he has something in his eye.`; } });
      return { title: 'MAY I CUT IN?', text: `Halfway through the slow dance, ${b.name} taps ${bN()} firmly on the shoulder. "My turn." She is not asking.`, choices: ch };
    } },
    { id: 'kids', cond: () => kids.length >= 2, build() {
      const k = pick(kids), fg = byRole('Flower Girl');
      return { title: 'KIDS ON THE FLOOR!', text: `Thirty seconds into the slow dance, ${k.name} and ${kids.length - 1} other kid${kids.length > 2 ? 's' : ''} storm the dance floor and start doing knee-slides in circles around the couple.`, choices: [
        { label: 'Let them join in', fn() { moodAll(10, p => p.look.kid); joy(45); bliss(2); memory('The first dance kid invasion', 30); return `It's chaos. Sweet, sticky chaos. ${gN()} ends up dancing with a five-year-old on each foot.`; } },
        { label: `${bN()} dances with ${fg ? fg.name : 'the littlest one'}`, fn() { joy(55); bliss(6); heartsAt(19.5, 16.5, 12); return `${bN()} scoops up ${fg ? fg.name : 'the littlest kid'} and twirls her round. Every phone in the room is filming. That's the photo of the day.`; } },
        { label: 'Send them to the bouncy castle', fn() {
          if (countObj('castle')) { joy(20); bliss(5); return `One mention of the bouncy castle and they vanish like a flock of starlings. The couple get their moment.`; }
          moodAll(-10, p => p.look.kid); joy(-10); bliss(-2); return `There is no bouncy castle. The kids sulk under the cake table and one of them bites a groomsman.`; } },
      ] };
    } },
    { id: 'wrongsong', cond: () => !nodj && G.djHired, build() {
      const song = pick(['the Crazy Frog', 'Agadoo', 'Cotton Eye Joe', 'the Birdie Song', 'Gangnam Style', 'a heavy metal cover of Ave Maria', 'the Match of the Day theme']);
      return { title: 'WRONG SONG!', text: `The lights dim, ${gN()} and ${bN()} gaze into each other's eyes... and the DJ plays ${song}. It is the wrong song. It is VERY much the wrong song.`, choices: [
        { label: 'Commit to it!', fn() {
          G.musicOverride = { track: 'disco', until: G.time + 6, start: G.time };
          if (chance(0.6)) { funAll(-20); joy(90); memory(`First dance to ${song}`, 50); return `They look at each other, shrug, and go ALL IN. Full commitment. The room is screaming. It's the best first dance anyone has ever seen.`; }
          joy(30); bliss(-4); return `They try. They really try. ${bN()}'s face says she'll be having words with the DJ later.`; } },
        { label: 'Frantically wave at the DJ', fn() {
          if (chance(0.6)) { joy(25); bliss(4); return `He swaps it after one verse and the real song kicks in. Lovely. Nobody will ever forget that first verse, though.`; }
          joy(10); bliss(-5); return `He thinks you're dancing, gives you a thumbs up and turns it UP.`; } },
        { label: 'Sing the right song over the top', fn() { joy(40); bliss(6); heartsAt(19.5, 16.5, 10); return `${gN()} sings their real song into ${bN()}'s ear over the top of ${song}. She's crying with laughter. Weirdly, it's perfect.`; } },
      ] };
    } },
    { id: 'troupe', build() {
      return { title: 'THE GINGERBREAD MEN', text: `Ten seconds into the slow dance the music cuts and ${gN()}'s mates burst onto the floor in matching ginger wigs and green waistcoats. They've been rehearsing in secret. They call themselves "The Gingerbread Men".`, choices: [
        { label: 'Let the troupe take over', fn() {
          if (chance(0.6)) { joy(100); memory('The Gingerbread Men', 60); confettiAt(19.5, 16.5, 40); return `It's TIGHT. Spins, slides, a human pyramid. The finale is them all pointing at ${gN()}. The room erupts.`; }
          joy(35); return `Three of them go left. Four go right. One goes straight into the DJ booth. Still a standing ovation.`; } },
        { label: `${gN()} joins the formation`, fn() {
          if (chance(0.5)) { joy(120); bliss(5); memory('The groom joined his own flash mob', 70); return `Plot twist: ${gN()} was in on it! He rips off his jacket and slots into the middle. ${bN()} is screaming.`; }
          joy(40); bliss(-3); return `${gN()} doesn't know the routine; he was meant to be surprised. He does "the sprinkler" for three minutes while his mates dance round him.`; } },
        { label: 'Ask them to wait one song', fn() { joy(15); bliss(6); return `They wait, sulking adorably in their wigs, while the couple have their moment. Then they go absolutely bonkers to the next song.`; } },
      ] };
    } },
    { id: 'nodj', weight: 3, cond: () => nodj, build() {
      const why = G.band ? 'The ceilidh band are on their tea break.' : G.djHired ? 'The DJ has picked this exact moment to pop out to his van.' : 'Nobody booked a DJ.';
      const ch = [
        { label: 'Phone in a saucepan for volume', fn() {
          if (chance(0.6)) { joy(35); bliss(6); return `Tinny, but surprisingly romantic. Someone holds the saucepan up like a lighter at a gig.`; }
          joy(15); bliss(-3); return `Halfway through it plays an advert for car insurance. They keep dancing through it, grimly.`; } },
        { label: 'Dance in total silence', fn() { joy(20); bliss(9); heartsAt(19.5, 16.5, 12); return `No music at all. Just the two of them, foreheads touching, swaying. Weirdly, it's the most romantic thing anyone has seen all year.`; } },
      ];
      const singer = isHere(G.gran) ? G.gran : isHere(b) ? b : null;
      ch.splice(1, 0, singer
        ? { label: `${singer.name} sings it`, fn() { joy(60); bliss(6); singer.happy += 20; memory(`${singer.name} sang the first dance`, 40); return `${singer.name} stands up and sings it, unaccompanied, in a voice like warm honey. Nobody knew. The whole room joins the last chorus.`; } }
        : { label: 'The guests hum it', fn() { joy(40); bliss(5); return `Eighty people humming the same tune, mostly. It's daft and lovely.`; } });
      return { title: 'THE FIRST DANCE', text: `${gN()} and ${bN()} take the floor... and there's no music. ${why} Somebody is fumbling with a phone.`, choices: ch };
    } },
  ]);
  return withAfter(ev, firstDanceAfter);
}

function evBouquet() {
  return pickVariant('bouquet', [
    { id: 'classic', build() {
      return { title: 'BOUQUET TOSS', text: `${bN()} lines up the single guests behind her, turns her back and winds up...`, choices: [
        { label: 'Gentle lob', fn() { return catchBouquet(false); } },
        { label: 'Full overhead launch', fn() { return catchBouquet(true); } },
      ] };
    } },
    { id: 'garter', build() {
      return { title: 'THE GARTER TOSS', text: `Before the bouquet, tradition demands the garter. ${gN()} retrieves it with as much dignity as he can manage while ${nameOr(G.mob, "the bride's mum")} watches like a hawk. The single lads line up, looking nervous.`, choices: [
        { label: 'Ping it like a catapult', fn() { return catchGarter(true); } },
        { label: 'Gentle underarm throw', fn() { return catchGarter(false); } },
        { label: 'Skip it, too embarrassing', fn() { joy(5); bliss(3); return `${gN()} tucks it in his pocket. ${nameOr(G.mob, 'Her mum')} nods with grim approval. The lads look relieved.`; } },
      ] };
    } },
    { id: 'ribbons', build() {
      const moh = isHere(G.moh) ? G.moh : null;
      const ch = [{ label: 'Everyone pull!', fn() { return `Everyone yanks a ribbon at once... ` + catchBouquet(false); } }];
      if (moh) ch.push({ label: `Rig it for ${moh.name}`, fn() {
        if (chance(0.5)) { joy(40); bliss(2); return `${moh.name} pulls the charm ribbon "by pure chance". She immediately stares at her boyfriend. He goes pale.`; }
        joy(10); bliss(-3); return `Everyone saw ${bN()} hand ${moh.name} the right ribbon. There is a formal complaint from ${nameOr(G.gran, 'an auntie')}.`; } });
      ch.push({ label: 'Hand the ribbons to the kids', fn() { joy(30); moodAll(10, p => p.look.kid); return `Every child in the building pulls a ribbon in a different direction. The bouquet explodes. Everyone gets a flower. Somehow it works.`; } });
      return { title: 'THE RIBBON PULL', text: `${bN()} has tied ribbons around the bouquet, one for each single guest. Only one of them is tied to the little silver charm. Everyone grabs a ribbon end and holds their breath...`, choices: ch };
    } },
    { id: 'decoy', build() {
      const decoy = pick(['cabbage leaves', 'bread rolls', 'spring onions', 'pickled gherkins on sticks']);
      return { title: 'THE DECOY BOUQUET', text: `${bN()} winks at the crowd and holds up TWO bouquets: the real one, and a decoy made entirely of ${decoy}. The singles are eyeing both suspiciously.`, choices: [
        { label: 'Throw the decoy first', fn() {
          if (chance(0.55)) { joy(15); return `The singles dive for the decoy and land in a heap. While they're down, the real one sails over their heads... ` + catchBouquet(true); }
          joy(35); bliss(-2); return `${nameOr(G.gerald, 'An uncle')} catches the decoy and eats it. All of it. ${bN()} panics and keeps the real one.`; } },
        { label: 'Throw both at once', fn() { joy(15); return `Two bouquets in the air! Pandemonium. ` + catchBouquet(true); } },
        { label: `Give the real one to ${nameOr(G.babushka, nameOr(G.gran, 'the oldest guest'))}`, fn() { joy(30); bliss(6); return `${bN()} walks over and simply hands it to her. A sweet moment. The ${decoy} bouquet goes to the goat.`; } },
      ] };
    } },
  ]);
}
function catchBouquet(wild) {
  const goat = G.people.some(a => a.role === 'goat' && a.present);
  const hens = G.people.some(p => p.role === 'Hen Party' && isHere(p));
  const opts = [['moh', isHere(G.moh) ? (wild ? 1 : 4) : 0], ['gran', isHere(G.gran) ? 2 : 0], ['babushka', isHere(G.babushka) ? 1.5 : 0],
    ['kid', guests().some(p => p.look.kid) ? 1.5 : 0], ['bouncer', hasBouncer() ? 2 : 0], ['dj', G.djHired ? 1.5 : 0],
    ['goat', goat ? 3 : 0], ['fountain', countObj('fountain') ? (wild ? 3 : 1) : 0], ['light', wild ? 2 : 0.3],
    ['gerald', isHere(G.gerald) ? 1.2 : 0], ['dmitri', isHere(G.dmitri) ? 1 : 0], ['kyle', isHere(G.kyle) ? (wild ? 1.5 : 0.8) : 0],
    ['groom', wild ? 1 : 0.3], ['celeb', isHere(G.celeb) ? 1.5 : 0], ['hens', hens ? 3 : 0], ['random', 2]];
  switch (weighted(opts)) {
    case 'moh': joy(30); bliss(2); return `${G.moh.name} catches it and immediately stares at her boyfriend. He goes pale.`;
    case 'gran': joy(50); memory('Gran caught the bouquet', 50); return `${G.gran.name} dives full length and catches it. "Watch out, bingo hall."`;
    case 'babushka': joy(50); memory('Babushka caught the bouquet', 50); return `${G.babushka.name} snatches it out of the air one-handed. She is 84. She winks at ${nameOr(G.dmitri, 'the nearest widower')}.`;
    case 'kid': { const k = randGuest(p => p.look.kid); joy(30); return `${k ? k.name : 'A seven-year-old'} catches it and announces they are marrying the DJ.`; }
    case 'bouncer': joy(40); memory('The bouncer caught the bouquet', 40); return `The bouncer catches it. He sheds a single, perfect tear.`;
    case 'dj': joy(30); return `It lands on the DJ decks. The record scratches. He takes a bow.`;
    case 'goat': joy(45); memory('The goat ate the bouquet', 50); return `The goat catches it. In its mouth. Then eats it.`;
    case 'fountain': joy(35); return `Straight into the chocolate fountain. A chocolate bouquet. Delicious.`;
    case 'light': joy(25); return `It lodges in the light fitting. It's still up there.`;
    case 'gerald': joy(40); G.gerald.happy += 15; return `It lands in ${G.gerald.name}'s pint with a splash. He fishes it out, drinks the pint, and asks who the lucky lady is.`;
    case 'dmitri': joy(45); G.dmitri.happy += 15; return `${G.dmitri.name} catches it without even putting his vodka down, then proposes to the bar staff. They say "maybe".`;
    case 'kyle': {
      const rival = anyGuest(p => p !== G.kyle && ['idle', 'dance', 'chat', 'watch'].includes(p.state));
      if (rival && chance(0.35) && ['idle', 'dance', 'chat', 'watch', 'walk'].includes(G.kyle.state)) { joy(10); startFight(G.kyle, rival); return `${G.kyle.name} and ${rival.name} both grab it. A tug of war becomes a scuffle. Petals everywhere.`; }
      joy(35); messNear('petals', 19, 16, 3, 2); return `${G.kyle.name} rugby-tackles three bridesmaids to get it, then holds it aloft like the FA Cup.`; }
    case 'groom': joy(45); bliss(4); heartsAt(G.groom.x, G.groom.y, 8); return `It hits the ceiling, bounces off a beam and lands right back in ${gN()}'s arms. "Guess I'm getting married again!" ${bN()} is NOT amused. Then she is.`;
    case 'celeb': joy(55); memory('A celebrity caught our bouquet', 40); return `${G.celeb.name} catches it and poses for photos with it. The paparazzi (if any) go wild.`;
    case 'hens': joy(40); return `A hen from next door elbows through and catches it. Her friends scream. She's getting married next Saturday, so it's a bit late.`;
    default: { const g = anyGuest(); if (g) g.happy += 20; joy(30); return `${g ? g.name : 'Someone'} catches it and shrieks with joy.`; }
  }
}
function catchGarter(wild) {
  const goat = G.people.some(a => a.role === 'goat' && a.present);
  const opts = [['bm', isHere(G.bestMan) ? (wild ? 1.5 : 3) : 0], ['gerald', isHere(G.gerald) ? 2 : 0], ['dmitri', isHere(G.dmitri) ? 1.5 : 0],
    ['kyle', isHere(G.kyle) ? 1.5 : 0], ['gdad', isHere(G.gdad) ? 1 : 0], ['babushka', isHere(G.babushka) ? 1 : 0],
    ['light', wild ? 2 : 0.3], ['mob', isHere(G.mob) ? (wild ? 1.5 : 0.5) : 0], ['goat', goat ? 2 : 0], ['random', 2]];
  switch (weighted(opts)) {
    case 'bm': joy(30); return `${G.bestMan.name} catches it, looks over at ${nameOr(G.moh, 'the bridesmaids')}, and winks. She rolls her eyes so hard she nearly falls over.`;
    case 'gerald': joy(45); memory(`${G.gerald.name}'s garter headband`, 30); return `It lands on ${G.gerald.name}'s head. He wears it as a headband for the rest of the night and refuses to discuss it.`;
    case 'dmitri': joy(40); return `${G.dmitri.name} catches it and slides it onto his arm like a medal. "I will wear with honour." He salutes.`;
    case 'kyle': joy(30); G.kyle.happy += 15; return `${G.kyle.name} catches it, rips his shirt off for no reason and does a lap of the dance floor.`;
    case 'gdad': joy(35); return `${G.gdad.name} catches it purely by reflex. ${nameOr(G.gmum, 'His wife')} confiscates it within four seconds.`;
    case 'babushka': joy(55); memory('Babushka caught the garter', 40); return `${G.babushka.name} plucks it out of the air and tucks it into her handbag without a word. Nobody dares ask for it back.`;
    case 'light': joy(25); return `It pings straight up and hooks on the light fitting, next to the bouquet from last week's wedding.`;
    case 'mob': joy(40); bliss(-2); return `It hits ${G.mob.name} square on the hat. She removes it with two fingers and the look of a woman planning a complaint.`;
    case 'goat': joy(40); return `The goat jumps and catches it. It is now wearing it as a collar and looks extremely pleased with itself.`;
    default: { const g = anyGuest(p => p.look.sex === 'm') || anyGuest(); if (g) g.happy += 15; joy(30); return `${g ? g.name : 'Some lad'} catches it and goes bright red. His mates won't let it go.`; }
  }
}

function evFOB() {
  const f = G.fob, fname = f.name, fIn = isHere(f);
  return pickVariant('fob', [
    { id: 'notes', cond: () => fIn, build() {
      const pages = ri(7, 23);
      return { title: 'FATHER OF THE BRIDE', text: `${fname} taps his glass, stands up, and unfolds ${pages} pages of notes. Single-spaced. Both sides.`, choices: [
        { label: 'Go on then', fn() {
          const r = Math.random();
          if (r < 0.35) { joy(40); bliss(5); return `Short, sweet and heartfelt. "Look after her, ${gN()}." Lovely.`; }
          if (r < 0.65) { joy(5); funAll(25); return pick([`Forty minutes. He covers every year of ${bN()}'s life. In order.`, `Page ${ri(3, pages)} is a list of every car he has ever owned. Someone on table five is asleep.`]); }
          joy(45); memory('Dad cried. Everyone cried.', 40); return `He gets three lines in and breaks down. Then everyone breaks down.`; } },
        { label: 'Suggest he keeps it short', fn() {
          if (chance(0.7)) { joy(30); bliss(3); return pick([`Straight to the point and genuinely lovely.`, `He folds the notes away, looks at ${bN()} and says "I am so proud." That's it. That's the speech. Perfect.`]); }
          joy(10); funAll(20); return `He reads all ${pages} pages anyway. Then the appendix.`; } },
        { label: 'Quietly pinch page six', fn() {
          if (chance(0.5)) { joy(55); bliss(2); memory('The missing page six', 30); return `Page six turns out to be all about ${bN()}'s teenage goth phase. She mouths "thank you" across the room.`; }
          f.happy -= 15; joy(-10); bliss(-3); return `He notices instantly. "Who has taken page six?!" He reconstructs it from memory, at length, while glaring at you.`; } },
      ] };
    } },
    { id: 'slideshow', cond: () => fIn, build() {
      const n = ri(8, 34) * 10;
      return { title: 'FATHER OF THE BRIDE', text: `${fname} has wheeled a projector up to the top table. "I will not speak long," he says. "I have prepared ${n} photographs."`, choices: [
        { label: 'Roll the slideshow', fn() {
          const r = Math.random();
          if (r < 0.4) { joy(50); bliss(-2); memory('The bath-time baby photos', 40); return `Baby ${bN()} in the bath. Baby ${bN()} in a bucket. Baby ${bN()} dressed as a cabbage. She wants the floor to swallow her. Everyone else is in heaven.`; }
          if (r < 0.7) { joy(10); funAll(20); return `By slide 60 it has somehow become his fishing holiday in Sochi. Every fish. Every angle. The British side have glazed over.`; }
          joy(70); bliss(6); memory('The then-and-now slideshow', 50); return `It ends on a photo of five-year-old ${bN()} "marrying" a teddy bear in a ginger wig, next to a photo from today. The room absolutely melts.`; } },
        { label: 'Vet the slides first', fn() { joy(30); bliss(3); return pick([`You trim it to twelve tasteful photos. ${fname} calls it "the trailer" and promises the full version at Christmas.`, `You quietly delete a slide of ${bN()}'s ex. Nobody will ever know how close that was.`]); } },
        { label: '"Technical difficulties"', fn() {
          if (chance(0.5)) { joy(20); return `The projector mysteriously "breaks". ${fname} shrugs and simply describes each photo out loud instead. It's somehow funnier.`; }
          f.happy -= 30; joy(-5); bliss(-3); return `He finds the unplugged cable in about four seconds and stares straight at you. The slideshow resumes. Colder.`; } },
      ] };
    } },
    { id: 'russian', cond: () => fIn, build() {
      return { title: 'OTETS NEVESTY', text: `${fname} stands, raises his glass and delivers the ENTIRE speech in Russian. It's passionate. There are hand gestures. The Russian side are dabbing their eyes; the British side are nodding along, just in case. Now he wants a toast.`, choices: [
        { label: 'Everyone: "ZA MOLODYKH!"', fn() {
          for (const p of guests()) if (alcoholOK(p)) p.drunk += 8;
          if (chance(0.65)) { joy(55); bliss(4); memory('The whole room toasted in Russian', 40); return pick([`Eighty people shout "ZA MOLODYKH!" in eighty accents. ${fname} is delighted.`, `The British side bellow something like "ZAMMO LOAD-ICK". Close enough. ${fname} hugs the nearest Englishman.`]); }
          joy(25); return `Half the room says "ZA MOLODYKH!", the other half says "Cheers!", and ${nameOr(G.gerald, 'one uncle')} shouts "BINGO!". The spirit was there.`; } },
        { label: `${bN()} translates`, fn() {
          if (chance(0.55)) { joy(45); bliss(7); heartsAt(G.bride.x, G.bride.y, 8); return `"He says... he was nervous about an English son-in-law, but ${gN()} has a good heart and strong hands for the dacha." ${gN()} goes as red as his hair.`; }
          joy(40); return `He spoke for six minutes. ${bN()} translates it as "He says welcome." Everyone suspects some editing.`; } },
        { label: 'Smile and nod knowingly', fn() {
          if (chance(0.5)) { joy(20); return `Nobody notices a thing. You pick up the word "vodka" four times.`; }
          joy(-5); bliss(-2); return `He pauses for a laugh and you are the only one who laughs. Wrong moment. It was the sad bit about his old dog.`; } },
      ] };
    } },
    { id: 'lostnotes', cond: () => fIn, build() {
      const bm = G.bestMan.name;
      return { title: 'FATHER OF THE BRIDE', text: `${fname} stands, pats his pockets, then pats them again. The notes are gone. "No problem," he announces. "I will speak from the heart." The Russian side brace themselves.`, choices: [
        { label: 'Let him wing it', fn() {
          const r = Math.random();
          if (r < 0.35) { joy(65); bliss(6); memory('Dad spoke from the heart', 50); return `No notes, no jokes, just a dad talking about his little girl. ${nameOr(G.mob, 'Her mum')} is sobbing. So is the DJ.`; }
          if (r < 0.7) { joy(10); funAll(20); return `It becomes a 25-minute story about a tractor he owned in 1987. It has a twist. The twist is also about the tractor.`; }
          joy(35); return `He forgets ${gN()}'s name halfway and calls him "the ginger one". It sticks for the rest of the night.`; } },
        { label: 'Slip him a napkin with bullet points', fn() { joy(30); bliss(3); return `He reads your napkin out word for word, including "DON'T MENTION THE EX". Big laugh. Even ${bN()}.`; } },
        { label: `${bm} lends him some notes`, fn() {
          if (chance(0.45)) { joy(70); memory(`Dad read the best man's speech`, 50); return `Wrong notes: they're the BEST MAN'S speech. ${fname} reads the stag-do jokes in a deadpan Russian accent and gets every laugh. ${bm} is now speechless. Literally.`; }
          joy(-15); bliss(-5); return `They're ${bm}'s notes. ${fname} reads the Prague story aloud, slowly, not understanding a word of it. ${nameOr(G.mob, 'Her mum')} understands every word.`; } },
      ] };
    } },
    { id: 'song', cond: () => fIn, build() {
      const song = pick(['"Ochi Chyornye"', '"Kalinka"', 'a Russian love song about a birch tree', '"My Way", in Russian']);
      return { title: 'A SONG FOR MY DAUGHTER', text: `${fname} taps his glass... and instead of speaking, closes his eyes and launches into ${song}. Full baritone. No warning.`, choices: [
        { label: 'Let him sing', fn() {
          if (chance(0.55)) { joy(80); bliss(8); memory('Dad sang to the bride', 60); return pick([`It's magnificent. A deep, rolling voice nobody knew he had. ${bN()} is in bits.`, `He holds the last note so long a waiter has to sit down. Standing ovation.`]); }
          joy(25); funAll(10); return `He's going for every verse. There are eleven verses. They are all about the same birch tree.`; } },
        { label: 'Get the room to join in', fn() {
          funAll(-15);
          if (chance(0.6)) { joy(60); memory('The great top-table singalong', 40); return `The Russian side know every word. The British side clap along gamely and shout "HEY!" at random. It works.`; }
          joy(30); bliss(-2); return `${nameOr(G.gerald, 'An uncle')} joins in with the wrong song entirely. It becomes a mash-up nobody asked for.`; } },
        { label: 'Hand him a glass of water', fn() { f.happy -= 10; joy(10); return `He takes the hint, sips, and gives a two-line speech instead. Polite applause. A missed opportunity, some say.`; } },
      ] };
    } },
    { id: 'mob', cond: () => isHere(G.mob), build() {
      const m = G.mob;
      const text = fIn
        ? `${fname} stands up and clears his throat, but ${m.name} calmly takes the microphone out of his hand. "Sit down, darling. You will cry. I will do this."`
        : `${fname} is nowhere to be seen, so ${m.name} stands, takes the microphone and smooths her dress. "My husband is... indisposed. I will do this."`;
      const ch = [
        { label: 'Let her speak', fn() {
          const r = Math.random();
          if (r < 0.4) { joy(55); bliss(6); memory(`${m.name}'s speech`, 40); return `Elegant, funny and devastatingly well-timed. She ends with "${gN()}, you are now my son. Don't make me regret it." Huge cheer.`; }
          if (r < 0.7) { joy(35); bliss(-6); return `She lists ${bN()}'s previous boyfriends, "for context", and rates each one out of ten. ${gN()} gets a seven. "For now."`; }
          joy(40); bliss(-3); return `She announces she has booked a holiday cottage next to the newlyweds' honeymoon. "So we can help." ${bN()} has gone very still.`; } },
        { label: 'Gently ask for the mic back', fn() {
          if (chance(0.4)) { joy(15); return `She hands it over with a gracious smile, and a look that says this conversation is not over.`; }
          m.happy -= 30; joy(-10); bliss(-5); return `She keeps the mic, and now she's annoyed. The speech is mostly about wedding planners who "do not know their place".`; } },
      ];
      if (fIn) ch.splice(1, 0, { label: 'Make it a double act', fn() {
        if (chance(0.6)) { joy(70); memory('The parents\' double act', 40); return `They bicker like a sitcom couple, finishing and correcting each other's sentences. The room is crying laughing. It should be on telly.`; }
        joy(20); funAll(15); return `They argue for ten minutes about which year ${bN()} learned to swim. It's never resolved.`; } });
      return { title: 'MOTHER OF THE BRIDE', text, choices: ch };
    } },
    { id: 'babushka', cond: () => isHere(G.babushka), build() {
      const b = G.babushka;
      return { title: 'BABUSHKA HAS THE FLOOR', text: `${fIn ? `${fname} stands, says "My mother would like to say something," and sits straight back down. ` : ''}${b.name} rises slowly, adjusts her headscarf, and fixes ${gN()} with a long, appraising stare. The room goes silent.`, choices: [
        { label: 'Let her speak', fn() {
          const r = Math.random();
          if (r < 0.45) { joy(70); bliss(8); memory(`${b.name}'s blessing`, 50); return `She presents ${gN()} with her late husband's fur hat and declares him "acceptable". From her, that's a knighthood.`; }
          if (r < 0.75) { joy(45); return `She lists everything ${gN()} must now learn: pickling, chopping wood, and how to drink vodka "like a man, not like a ${nameOr(G.gerald, "Gerald").split(" ").pop()}".`; }
          joy(25); bliss(-3); return `She asks, in front of everyone, when the great-grandchildren are coming. She wants a date. ${bN()} wants to leave.`; } },
        { label: 'Pour her a vodka first', fn() { b.drunk += 12; b.happy += 15; joy(50); return `She downs it, slams the glass down and gives the shortest, funniest speech of the day: "Good boy. Feed him more." Huge cheer.`; } },
        { label: 'Ask for "the short version"', fn() {
          if (chance(0.35)) { joy(30); return `"Fine. Short version: be good to her, or I will know." Sits down. Chills.`; }
          b.happy -= 35; joy(-15); bliss(-6); return `She turns slowly to look at you. She does not speak. She does not need to. The room drops five degrees.`; } },
      ] };
    } },
    { id: 'standin', cond: () => !fIn, build() {
      const r = isHere(G.moh) ? G.moh : isHere(G.mob) ? G.mob : null;
      const reader = r ? r.name : bN();
      return { title: 'FATHER OF THE BRIDE?', text: `It's time for the father of the bride's speech... but ${fname} has gone AWOL. ${reader} finds that he emailed the speech to her "just in case" and stands up with a phone.`, choices: [
        { label: 'Read his speech out', fn() {
          if (chance(0.55)) { joy(45); bliss(4); return `It's lovely. Short, a bit formal, and signed off "Love, Papa (sent from my phone)". There are tears.`; }
          joy(20); bliss(-2); return `Autocorrect has been at it. "${gN()} is a fine young man" now reads "${gN()} is a fine young MANGO". The nickname is permanent.`; } },
        { label: 'Video-call him in', fn() {
          if (chance(0.5)) { joy(55); bliss(5); memory('The speech by video call', 40); return `He answers from the car park, delivers a beautiful speech into his phone, then walks back in to a standing ovation.`; }
          joy(15); bliss(-3); return `He answers from the gents. Everyone hears the flush. He carries on anyway.`; } },
        { label: 'Skip to the next speech', fn() { joy(-5); bliss(-4); return `Probably wise, but ${bN()} keeps glancing at the door all through the next speech.`; } },
      ] };
    } },
  ]);
}

function evGroomSpeech() {
  const d = G.dmitri;
  return pickVariant('groom', [
    { id: 'classic', build() {
      return { title: "THE GROOM'S SPEECH", text: `${gN()} stands, adjusts his beige waistcoat and clears his throat. Which speech did he prepare?`, choices: [
        { label: 'Heartfelt & sincere', fn() { joy(40); bliss(10); heartsAt(G.groom.x, G.groom.y, 10); return `He thanks everyone, then turns to ${bN()}. The room melts.`; } },
        { label: 'Stand-up comedy set', fn() {
          if (chance(0.5)) { joy(80); memory('The groom killed it', 50); return `He absolutely kills it. Someone suggests he goes on tour.`; }
          joy(10); bliss(-2); return `Tumbleweed. A single cough. A fork hits a plate.`; } },
        { label: 'Sing a song to the bride', fn() {
          if (chance(0.55)) { joy(90); bliss(10); memory("The groom's serenade", 60); return `He sings. It's beautiful. ${bN()} is in floods of tears.`; }
          joy(40); bliss(5); return `He forgets the second verse and hums the rest. Somehow, still lovely.`; } },
      ] };
    } },
    { id: 'russian', build() {
      return { title: "THE GROOM'S SPEECH", text: `${gN()} stands up and announces he has learned a speech in Russian for his new family. He has been practising on an app for six weeks. The Russian side lean forward. ${bN()} looks nervous.`, choices: [
        { label: 'Go for it, all in Russian', fn() {
          const r = Math.random();
          if (r < 0.45) { joy(75); bliss(8); memory('The groom spoke Russian!', 50); return `The accent is dreadful, the grammar wobbles, the heart is enormous. ${nameOr(G.fob, 'Her dad')} stands up and hugs him mid-sentence.`; }
          if (r < 0.8) { joy(50); return `He means to say "I love your daughter". He actually says "I love your tractor". The Russian side cry with laughter. ${nameOr(G.fob, 'Her dad')} seems fine with both.`; }
          joy(20); bliss(-3); return `He confidently thanks ${nameOr(G.mob, 'his mother-in-law')} for "the beautiful potato". She has no idea what he means. Neither does he.`; } },
        { label: 'Just "Spasibo!" and sit down', fn() { joy(20); bliss(2); return `One word, perfectly pronounced, and a little bow. The Russian aunties applaud. Quit while you're ahead.`; } },
        { label: `${bN()} prompts him line by line`, fn() { joy(40); bliss(7); heartsAt(G.groom.x, G.groom.y, 8); return `She whispers each line, he repeats it, she corrects him, he repeats it again. It's like watching a very sweet driving lesson.`; } },
      ] };
    } },
    { id: 'cards', build() {
      return { title: "THE GROOM'S SPEECH", text: `${gN()} stands up and immediately knocks his cue cards off the table. They scatter under the top table. He gathers them up. They are no longer in any kind of order.`, choices: [
        { label: 'Read them in whatever order', fn() {
          if (chance(0.5)) { joy(45); return `He thanks the caterers for marrying him and tells ${bN()} the vegan option was lovely. It's the best accidental speech ever given.`; }
          joy(15); funAll(10); return `He reads the same card three times. It's the one about the weather.`; } },
        { label: 'Ditch the cards, speak from the heart', fn() {
          if (chance(0.6)) { joy(60); bliss(10); memory('No cards, all heart', 40); return `He puts the cards down, looks at ${bN()}, and just talks. Simple, honest, perfect.`; }
          joy(15); bliss(4); return `He says "I love you," then forgets absolutely everything else. Honestly? That'll do.`; } },
        { label: `${G.bestMan.name} sorts them out`, fn() {
          if (chance(0.5)) { joy(35); return `Back in order in ten seconds. Solid speech. ${G.bestMan.name} takes a bow he hasn't earned.`; }
          joy(-15); bliss(-5); return `The best man has slipped in a card of his own. ${gN()} reads out "I would also like to apologise for Prague" before he can stop himself.`; } },
      ] };
    } },
    { id: 'thanks', build() {
      return { title: "THE GROOM'S SPEECH", text: `${gN()} stands for the traditional thank-yous. He has a list. He has not checked the list.`, choices: [
        { label: 'Flowers for both mums (£60)', fn() { cash(-60); joy(45); bliss(6); return `He produces two bouquets from under the table. ${nameOr(G.gmum, 'His mum')} and ${nameOr(G.mob, 'her mum')} both cry. Competitively. ${nameOr(G.mob, 'Her mum')} wins.`; } },
        { label: 'Thank everyone in one breath', fn() {
          if (chance(0.5)) { joy(40); return `"The-caterers-the-bridesmaids-the-registrar-the-DJ-our-parents-and-the-goat-next-door-THANK-YOU!" He goes slightly purple. Round of applause.`; }
          joy(10); bliss(-4); if (isHere(G.gmum)) G.gmum.happy -= 20; return `He thanks everyone. Except his own mum. ${nameOr(G.gmum, 'His mum')} is FINE. She says she is fine. Repeatedly.`; } },
        { label: `Just thank ${bN()} for saying yes`, fn() { joy(30); bliss(9); heartsAt(G.groom.x, G.groom.y, 10); return `"Mostly, I just want to thank ${bN()} for saying yes." He sits down. The room goes "awww" in perfect unison.`; } },
      ] };
    } },
    { id: 'video', build() {
      return { title: "THE GROOM'S SURPRISE", text: `${gN()} says he has a surprise for ${bN()} and points at a laptop. He secretly recorded video messages from her old friends back in St Petersburg.`, choices: [
        { label: 'Play the video', fn() {
          const r = Math.random();
          if (r < 0.5) { joy(80); bliss(10); memory('Messages from St Petersburg', 50); return `Her school friends, her old teacher, even her childhood neighbour, all waving and shouting her name. ${bN()} is in floods of happy tears.`; }
          if (r < 0.8) { joy(30); return `It buffers. For four minutes. Then plays upside down. ${bN()} loves it anyway and watches it on her phone under the table.`; }
          joy(40); bliss(-2); return `One friend's message is just her cat. Then a long close-up of the cat. The Russian side applaud the cat.`; } },
        { label: 'Read the messages out', fn() { joy(35); bliss(5); return `His pronunciation of the names is a crime against the Russian language, but ${bN()} is beaming.`; } },
        { label: 'Save it for the honeymoon', fn() { joy(5); bliss(4); return `He hands her the laptop with a wink. Private and sweet. The guests are a bit disappointed.`; } },
      ] };
    } },
    { id: 'nerves', build() {
      const ch = [
        { label: `${bN()} takes his hand`, fn() { joy(45); bliss(10); heartsAt(G.groom.x, G.groom.y, 10); return `She stands, takes his hand and whispers something. He laughs, relaxes, and gives a lovely little speech. Aww.`; } },
        { label: `Shout "GO ON, ${gN().toUpperCase()}!"`, fn() {
          if (chance(0.5)) { joy(50); memory('The whole room cheered him on', 40); return `The whole room joins in: "GO ON, ${gN().toUpperCase()}!" It snaps him out of it and he smashes the speech.`; }
          joy(15); return `He panics, says "Thanks for coming, drive safe," and sits down. Speech over.`; } },
      ];
      ch.push(isHere(d)
        ? { label: `${d.name} hands him a vodka`, fn() {
          if (chance(0.6)) { joy(70); memory('Dutch courage, Russian style', 40); return `One shot. His eyes water. Then he gives the most confident speech of his life. ${d.name} nods: "Now he is family."`; }
          joy(30); bliss(-4); return `One shot becomes three. He's now doing impressions of his in-laws. To their faces.`; } }
        : { label: 'Hand him a glass of water', fn() { joy(20); bliss(2); return `A sip, a breath, and a short, decent speech. Not legendary, but nobody fainted.`; } });
      return { title: "THE GROOM'S SPEECH", text: `${gN()} stands up, looks out at all the faces, and freezes. Completely. He has gone the colour of his hair. Ten seconds pass. Fifteen.`, choices: ch };
    } },
  ]);
}

const BM_JOKES = [
  { t: '"I\'ve known the groom since school, back when his hair was even MORE ginger."', risk: 1 },
  { t: 'Tell the "what happened in Prague" stag do story', risk: 3 },
  { t: "Read out the groom's old dating profile", risk: 2 },
  { t: '"He\'s looking a bit green today. Oh, no, that\'s just the suit."', risk: 1 },
  { t: 'Do an impression of the Mother of the Bride', risk: 3 },
  { t: "A slideshow of the groom's school photos", risk: 2 },
  { t: 'Thank the bridesmaids, sincerely and briefly', risk: 0 },
  { t: 'A poem he wrote on the train this morning', risk: 2 },
  { t: 'Read a "telegram from the King"', risk: 1 },
  { t: 'Reveal the groom cried at Toy Story 3. Twice.', risk: 1 },
  { t: "Re-enact the couple's first date with a mop", risk: 3 },
  { t: '"The groom has learned three Russian words for today. Two of them are vodka."', risk: 1 },
  { t: 'Hand out a quiz on the groom\'s ex-girlfriends', risk: 3 },
  { t: "Read the groom's texts from the night they met", risk: 2 },
  { t: 'Present a "survival kit" for married life', risk: 1 },
  { t: "A rap about the couple's love story", risk: 2 },
  { t: '"The bride looks stunning. The groom looks... present."', risk: 1 },
  { t: "Attempt a Russian accent. In front of the Russians.", risk: 3 },
  { t: 'Reveal what the stag fund was REALLY spent on', risk: 2 },
  { t: 'Compare the groom to a ginger Labrador', risk: 1 },
  { t: 'Reveal the groom once got lost in IKEA for four hours', risk: 1 },
  { t: 'Describe the first (failed) proposal attempt', risk: 2 },
  { t: 'A heartfelt toast to the bride', risk: 0 },
  { t: 'Bring out the inflatable sheep from the stag', risk: 3 },
  { t: 'Toast absent friends and the parents', risk: 0 },
  { t: '"Marriage is like a ginger in the sun: it takes work."', risk: 1 },
  { t: "Read out the groom's school report: \"Easily distracted by snacks\"", risk: 1 },
];
const RISK_LABEL = ['Safe', 'Cheeky', 'Risky', 'Career-ending'];
const BM_WIN = ['The room ERUPTS. The top table is crying with laughter.', 'Huge laugh. Even the registrar would have laughed.', 'Standing ovation. He drops the mic. There is no mic.', 'The top table are wheezing. The Russian side ask for it to be translated, then laugh twice as hard.', 'A proper belly laugh from every table. Somebody bangs the table so hard the cutlery jumps.'];
function bmLose() { return pick(["Silence. Someone's fork hits a plate. The Mother of the Bride's eyes narrow.", 'A groan. Then a slow, painful silence. He sits down.', `${bN()} is glaring. ${gN()} has his head in his hands.`, `A cough. A chair creaks. ${nameOr(G.babushka, 'An elderly auntie')} asks loudly "Is he finished?"`, 'He laughs at his own joke. Alone. For quite a long time.']); }
// A joke-style choice with the classic risk mechanic. pen = extra failure chance, mult = payout multiplier.
function riskChoice(label, risk, pen, mult, win, lose) {
  return { label: `${label}  [${RISK_LABEL[risk]}]`, fn() {
    const odds = Math.max(0.05, [1, 0.75, 0.55, 0.4][risk] - (risk ? pen : 0));
    if (chance(odds)) {
      joy(Math.round([25, 45, 75, 140][risk] * (mult || 1))); if (risk >= 2) memory("The best man's legendary speech", 40 * risk);
      return win ? win() : pick(BM_WIN);
    }
    joy(risk === 1 ? 10 : -20 * risk); bliss(-3 * risk);
    return lose ? lose() : bmLose();
  } };
}
function evBestMan() {
  const bm = G.bestMan, bmIn = isHere(bm);
  const notes = G.omens.has('notes'), pen = notes ? 0.15 : 0;
  // the two best men do their speech together
  const b2 = G.bestMan2, both = bmIn && isHere(b2);
  const BM = both ? `${bm.name} and ${b2.name}` : bm.name, v = (one, two) => both ? two : one;
  const TITLE = both ? "THE BEST MEN'S SPEECH" : "THE BEST MAN'S SPEECH";
  return pickVariant('bm', [
    { id: 'jokes', build() {
      const jokes = shuffle(BM_JOKES.slice()).slice(0, 3);
      return { title: TITLE, text: `${BM} ${v('stands', 'stand up together')}${both ? '' : ' up'}${notes ? ' without any notes' : ''}, ${v('sinks his pint', 'sink their pints')} and ${v('grins', 'grin')}.${both ? ` "We'll take it in turns," says ${b2.name}.` : ''} What's the big opener?`, choices: jokes.map(j => riskChoice(j.t, j.risk, pen, 1)) };
    } },
    { id: 'duo', weight: () => 2, cond: () => both, build() {
      return { title: 'TWO BEST MEN', text: `${bm.name} and ${b2.name} stand up together. They've clearly rehearsed. They've also clearly been at the bar. "${gN()} couldn't choose between us," says ${b2.name}. "So you're getting double."`, choices: [
        { label: 'The rehearsed double act  [Risky]', fn() {
          if (chance(0.6 - pen)) { joy(90); memory('The best men double act', 50); return `They finish each other's sentences. They do the voices. They even do a little dance at the end. Standing ovation from the stag table.`; }
          joy(5); bliss(-3); return `${b2.name} skips a page. ${bm.name} carries on from the old page. For four minutes they are telling two completely different stories at the same time.`; } },
        { label: `A rap battle about ${gN()}  [Cheeky]`, fn() { joy(55); return `"His name is ${gN()} and his hair is on fire, he married ${bN()} cos she's way out of his tier." ${pick(['It gets worse. It gets better.', 'The beat is ' + nameOr(G.babushka, 'Gran') + ' banging a spoon on the table.'])}`; } },
        { label: 'Let them fight over the mic  [Chaos]', fn() {
          if (chance(0.5)) { joy(70); funAll(10); return `A tug-of-war over the microphone ends with both of them in the cake trolley. The room is in bits. The speech was never delivered. Nobody minds.`; }
          joy(-10); bliss(-5); bm.happy -= 15; b2.happy -= 15; return `It gets a bit real. Something about who held ${gN()}'s hair on the stag do. ${nameOr(G.mob, "The bride's mum")} separates them.`; } },
      ] };
    } },
    { id: 'drunk', cond: () => bmIn, build() {
      const jokes = shuffle(BM_JOKES.filter(j => j.risk > 0)).slice(0, 2);
      const ch = jokes.map(j => riskChoice(j.t, j.risk, pen + 0.12, 1.3));
      ch.push({ label: 'Take his pint away first  [Safe]', fn() { bm.happy -= 10; joy(15); bliss(2); return `He sulks through a perfectly adequate speech, glancing longingly at the pint the whole time.`; } });
      return { title: TITLE, text: `${bm.name} has been at the bar since the ceremony.${both ? ` ${b2.name} has to help him up.` : ''} He stands up, misses, stands up again, and taps his glass with a fork until it cracks. "${gN()}..." he begins. "${gN().toUpperCase()}! I LOVE this man."${notes ? ' He has no notes. He has no plan.' : ''}`, choices: ch };
    } },
    { id: 'powerpoint', cond: () => bmIn, build() {
      const n = ri(30, 90);
      return { title: both ? "THE BEST MEN'S POWERPOINT" : "THE BEST MAN'S POWERPOINT", text: `${BM} ${v('plugs', 'plug')} a laptop into the projector. The title slide reads "${gN().toUpperCase()}: THE LOST YEARS (${n} slides)". There's clip art. There are transitions.`, choices: [
        { label: `All ${n} slides  [Risky]`, fn() {
          const r = Math.random() + pen;
          if (r < 0.4) { joy(70); memory("The best man's PowerPoint", 40); return `Pie charts of ${gN()}'s haircuts through the ages. A graph of his "rizz" over time. It's a masterpiece.`; }
          if (r < 0.75) { joy(10); funAll(20); return `Slide ${ri(20, n)} of ${n}. Every slide has a star-wipe transition. People are checking their watches.`; }
          joy(-20); bliss(-6); return `Halfway through, a message from the stag group chat pops up on the big screen. For everyone. ${nameOr(G.mob, "The bride's mum")} reads it twice.`; } },
        { label: 'Skip to the highlights  [Cheeky]', fn() { joy(40); return pick([`A photo of ${gN()} asleep in a kebab shop. A photo of ${gN()} dressed as a carrot. Short and deadly.`, `Five slides, five belly laughs. In and out like a pro.`]); } },
        { label: 'The secret "bonus" slide  [Career-ending]', fn() {
          if (chance(0.45 - pen)) { joy(120); bliss(6); memory("The best man's secret video", 60); return `It's a video of ${gN()} practising the first dance alone in his kitchen, in his socks, using a mop as ${bN()}. The room is destroyed.`; }
          joy(-30); bliss(-8); return `It's the stag do. Unedited. The projector is very bright. ${nameOr(G.babushka, 'An elderly relative')} has seen enough.`; } },
      ] };
    } },
    { id: 'moh', weight: () => bmIn ? 1 : 4, cond: () => isHere(G.moh), build() {
      const m = G.moh;
      return { title: 'THE BEST WOMAN', text: `${BM} ${bmIn ? v('has lost his voice', 'have both lost their voices') + ' from the stag chants and can only squeak' : 'is nowhere to be found'}. ${m.name}, the chief bridesmaid, has calmly taken over. She has notes. They are colour-coded.`, choices: [
        { label: `Stories about ${bN()} at uni  [Risky]`, fn() {
          if (chance(0.55 - pen)) { joy(75); memory(`${m.name} stole the show`, 40); return `The karaoke incident. The night bus incident. The "I'll never date a ginger" incident. ${bN()} is hiding behind her bouquet, laughing.`; }
          joy(15); bliss(-6); return `One story goes a bit too far. ${bN()} is pink. ${nameOr(G.mob, 'Her mum')} is pinker.`; } },
        { label: 'A speech in English AND Russian  [Cheeky]', fn() { joy(50); bliss(4); return `Every joke twice, once per side of the room. The Russian side get a different punchline, and it's clearly ruder. Both halves are in tears.`; } },
        { label: `Roast the groom instead  [Risky]`, fn() {
          if (chance(0.6 - pen)) { joy(80); memory('The groom got roasted', 40); return `"${gN()} is a lovely man. He's ginger, he's kind, and he once lost a fight to a revolving door." ${gN()} takes it like a champion.`; }
          joy(10); bliss(-3); return `She goes in hard. Maybe a bit too hard. ${gN()} is laughing in the way people laugh when they're hurt.`; } },
      ] };
    } },
    { id: 'telegrams', cond: () => bmIn, build() {
      const T = [
        { t: 'From the King: "Congratulations. Please return the bunting."', risk: 1 },
        { t: 'From the stag-do hotel in Prague, regarding the damages', risk: 2 },
        { t: `From ${bN()}'s ex in Moscow`, risk: 3 },
        { t: `From ${gN()}'s five-a-side team: "Can he still play Thursday?"`, risk: 1 },
        { t: `From ${gN()}'s mum's WhatsApp group (unedited)`, risk: 2 },
        { t: 'From the goat next door', risk: 1 },
        { t: `From ${bN()}'s auntie's cat in St Petersburg`, risk: 0 },
        { t: `From ${bN()}'s old gymnastics coach: "She could have gone to the Olympics"`, risk: 0 },
        { t: `From ${gN()}'s ex: "Good luck. You'll need it."`, risk: 3 },
        { t: `From the Eurovision jury: "${gN()} & ${bN()}, douze points"`, risk: 1 },
        { t: 'From the bank, about the wedding overdraft', risk: 2 },
        { t: `From ${gN()}'s barber: "See you in six weeks, Ginge"`, risk: 1 },
      ];
      return { title: 'THE TELEGRAMS', text: `${BM} ${v('stands and announces', 'stand up and announce')} that, sadly, some people couldn't make it today, "but they've sent telegrams". ${both ? b2.name : 'He'} pulls out a suspiciously thick envelope. Which one does he read first?`, choices: shuffle(T).slice(0, 3).map(x => riskChoice(x.t, x.risk, pen, 1, null, () => pick([`It goes down like a lead balloon. ${bm.name} quickly "loses" the rest of the envelope.`, bmLose()]))) };
    } },
    { id: 'shoe', cond: () => bmIn, build() {
      const Q = [
        { label: '"...is the better driver?"', fn() { if (chance(0.5)) { joy(40); bliss(3); return `Both raise ${bN()}'s shoe. ${gN()} doesn't even hesitate. Wise man.`; } joy(35); bliss(-3); return `They raise DIFFERENT shoes. A tense silence. Someone whispers "the M25 incident".`; } },
        { label: '"...takes longer to get ready?"', fn() { joy(35); return `Both raise ${gN()}'s shoe. The quiff doesn't do itself.`; } },
        { label: '"...said I love you first?"', fn() { if (chance(0.5)) { joy(50); bliss(8); heartsAt(G.groom.x, G.groom.y, 8); return `They each raise the OTHER's shoe. Everyone goes "awwww". ${bm.name} pretends to be sick.`; } joy(25); return `They both raise their OWN shoe. The room demands a recount.`; } },
        { label: '"...will really be in charge?"', fn() { joy(45); return `Before they can move, the entire Russian side shouts "${bN().toUpperCase()}!" ${gN()} slowly raises her shoe. Correct answer.`; } },
        { label: '"...is the better dancer?"', fn() { if (chance(0.5)) { joy(40); return `Both raise ${bN()}'s shoe, and ${gN()} does a little demonstration of why. Big laugh.`; } joy(30); bliss(-2); return `${gN()} raises his own shoe with great confidence. ${bN()} looks at him with real pity.`; } },
      ];
      return { title: 'THE SHOE GAME', text: `${BM} ${v('skips', 'skip')} the speech and ${v('sits', 'sit')} ${gN()} and ${bN()} back to back on two chairs, each holding one of their own shoes and one of the other's. "Raise the shoe of whoever..."`, choices: shuffle(Q).slice(0, 3) };
    } },
  ]);
}

function evSendoff() {
  const d = G.dmitri;
  const ev = pickVariant('sendoff', [
    { id: 'sparklers', build() {
      return { title: 'SPARKLER SEND-OFF', text: `The guests line the path with sparklers. ${gN()} and ${bN()} are ready to make their grand exit.`, choices: [
        { label: 'Sparklers (free)', fn() { joy(40); bliss(5); return pick([`A tunnel of sparkles. Perfect.`, `Eighty sparklers, one long golden tunnel. The photographer cries a little.`]); } },
        { label: 'Fireworks too! (£300)', fn() { cash(-300); joy(100); bliss(10); memory('Fireworks finale', 60); G.bigFireworks = true; return `BOOM. The sky lights up pink and gold. What a way to end the day.`; } },
      ] };
    } },
    { id: 'confetti', build() {
      const op = isHere(d) ? `${d.name} has volunteered to operate them. He has read none of the instructions.` : 'Nobody has read the instructions.';
      return { title: 'CONFETTI CANNONS', text: `The guests line the path. Two confetti cannons have been set up for the grand exit. ${op}`, choices: [
        { label: 'Fire the cannons! (£120)', fn() {
          cash(-120);
          if (chance(0.7)) { confettiAt(6, 11, 120); joy(70); bliss(6); memory('The confetti cannon exit', 40); return `FWOOMPH! A pink and gold blizzard. The couple vanish into it like rock stars.`; }
          messNear('litter', 6, 12, 6, 3); joy(40); bliss(-3); return `One fires perfectly. The other fires backwards into ${isHere(d) ? d.name : 'an uncle'}. He's fine. He's pink now.`; } },
        { label: 'Handfuls of petals (free)', fn() { confettiAt(6, 11, 40); joy(35); bliss(5); return `Old-fashioned handfuls of rose petals. Simple and lovely. An auntie collects them all in her handbag.`; } },
        { label: 'Cannons AND fireworks (£420)', fn() { cash(-420); confettiAt(6, 11, 120); G.bigFireworks = true; joy(120); bliss(10); memory('Fireworks finale', 60); return `Confetti on the ground, fireworks in the sky. Pure overkill. Absolutely glorious.`; } },
      ] };
    } },
    { id: 'getaway', build() {
      const V = [
        { label: 'Vintage Rolls-Royce (£250)', fn() {
          cash(-250);
          if (chance(0.8)) { joy(60); bliss(8); memory('The vintage car getaway', 40); return `Gleaming cream Rolls, tin cans clattering behind. Pure class.`; }
          joy(30); bliss(2); return `It won't start. The chauffeur and three uncles push it to the end of the lane. Still classy. Mostly.`; } },
        { label: `${isHere(G.gerald) ? G.gerald.name + "'s" : "The farmer's"} tractor (free)`, fn() {
          if (chance(0.6)) { joy(70); bliss(3); memory('Off into the night on a tractor', 50); return `${bN()} rides on the back in her white dress, waving like the Queen. ${gN()} drives at 4mph. Iconic.`; }
          messNear('mud', 6, 17, 4, 2); joy(35); bliss(-4); return `It sprays mud over the whole guard of honour on the way out. ${bN()}'s dress is now two-tone.`; } },
        { label: 'Horse and cart (£150)', fn() {
          cash(-150);
          if (chance(0.6)) { joy(75); bliss(8); memory('The horse and cart', 40); return `Clip-clop down the lane under the stars. Like something out of a costume drama.`; }
          messNear('mud', 6, 15, 3, 1); joy(40); bliss(-2); return `The horse leaves a parting gift right on the path. Several parting gifts. Guests are tiptoeing.`; } },
        { label: `${isHere(d) ? d.name + "'s" : 'A borrowed'} Lada (free)`, fn() {
          if (chance(0.45)) { joy(80); memory('The Lada getaway', 50); return `It starts first time! ${isHere(d) ? d.name + ' crosses himself' : 'The Russian side gasp'}. Off they go in a cloud of blue smoke, horn playing Kalinka.`; }
          joy(45); bliss(-2); return `It won't start. Thirty guests push the Lada down the lane chanting "DA-VAI! DA-VAI!" Somehow, even better.`; } },
      ];
      return { title: 'THE GETAWAY', text: `The guests line the path to wave them off. It's decision time: how are ${gN()} and ${bN()} leaving?`, choices: shuffle(V).slice(0, 3) };
    } },
    { id: 'helicopter', build() {
      const booker = isHere(d) ? `${d.name} arranged it as a "small surprise". The invoice, however, is addressed to you.` : 'Nobody admits to booking it. The invoice is addressed to you.';
      return { title: 'IS THAT A HELICOPTER?', text: `Thud-thud-thud. A helicopter is landing on the lawn, flattening the flowerbeds and every fascinator in the garden. ${booker}`, choices: [
        { label: 'Pay up and fly away (£600)', fn() { cash(-600); joy(140); bliss(12); memory('Helicopter exit!', 70); confettiAt(6, 11, 80); return `Up, up and away over the garden, waving out of the window. Nobody will ever top that. Your bank manager is crying, but for different reasons.`; } },
        { label: isHere(d) ? `Haggle with ${d.name}` : 'Haggle with the pilot', fn() {
          if (chance(0.5)) { cash(-250); joy(110); bliss(8); memory('Helicopter exit!', 70); return isHere(d) ? `${d.name} agrees to pay "most of it" after a hug and a vodka. Up and away!` : `The pilot knocks it down to £250 "because it's a wedding". Up and away!`; }
          if (isHere(d)) { cash(-600); joy(60); bliss(4); return `You somehow haggle ${d.name} UP. It's now the full £600, plus "a tip for the pilot". Still, it's a helicopter.`; }
          joy(15); bliss(-4); return `The pilot is not a haggler. He takes off empty. The couple walk out through the downdraft with their hair everywhere.`; } },
        { label: 'Send it away, walk out', fn() { joy(25); bliss(4); return `The helicopter leaves. ${gN()} and ${bN()} walk out hand in hand under the stars instead. Honestly? Lovely.`; } },
      ] };
    } },
    { id: 'tunnel', build() {
      return { title: 'THE TUNNEL OF ARMS', text: `The guests have formed a long tunnel of raised arms down the path, and the Russian side have declared a toll: the couple must kiss under every single pair of arms.`, choices: [
        { label: 'Kiss their way through', fn() { joy(60); bliss(8); heartsAt(6, 11, 16); memory('The kissing tunnel', 40); return `Forty-one kisses later they emerge at the gate, dizzy and grinning. The guests count every one.`; } },
        { label: 'Make a run for it!', fn() {
          if (chance(0.6)) { joy(45); return `They sprint through hand in hand, ${bN()}'s dress held up, ${gN()}'s quiff bouncing. The guests cheer them all the way out.`; }
          if (isHere(G.gerald)) fall(G.gerald); joy(30); bliss(-3); return `${nameOr(G.gerald, 'An uncle')} trips into the tunnel and collapses half of it like dominoes. Everyone's fine. Mostly on the grass.`; } },
        { label: 'Pay the toll in vodka', fn() { for (const p of guests()) if (alcoholOK(p)) p.drunk += 6; joy(50); bliss(3); return `A shot at each end of the tunnel, "for the road". The Russian side accept. The tunnel gets wobblier.`; } },
      ] };
    } },
    { id: 'rain', weight: 3, cond: () => G.raining, build() {
      return { title: 'A SOGGY SEND-OFF', text: `It's absolutely chucking it down. The sparklers are fizzling out as fast as they're lit. ${gN()} and ${bN()} are huddled in the doorway.`, choices: [
        { label: 'Umbrella guard of honour', fn() { joy(45); bliss(6); return `Thirty umbrellas form a tunnel. Dry as a bone. Very British. Very lovely.`; } },
        { label: 'Run through it, laughing', fn() {
          if (chance(0.6)) { joy(70); bliss(6); memory('Kissing in the rain', 50); return `They stop halfway, soaked, for one long kiss in the rain. The photographer gets it. That's the album cover.`; }
          joy(25); bliss(-5); return `${bN()}'s dress weighs about four stone by the gate. Her mascara has made a run for it too.`; } },
        { label: 'Fireworks anyway (£300)', fn() { cash(-300); G.bigFireworks = true; joy(80); bliss(6); memory('Fireworks in the rain', 40); return `Fireworks bursting through the rain clouds. Damp, defiant and beautiful.`; } },
      ] };
    } },
  ]);
  return withAfter(ev, () => coupleExit());
}

// ===================== NEW CEREMONY EVENTS =====================
EVENTS.push(
  { id: 'dog', pool: 'ceremony', build() {
    const owner = anyGuest(); const dog = pick(['spaniel', 'sausage dog', 'enormous Great Dane', 'very muddy Labrador', 'tiny fluffy Pomeranian']); const dn = pick(['Biscuit', 'Barry', 'Sputnik', 'Mr Wiggles', 'Boris', 'Pickle']);
    return { title: 'WOOF!', text: `Halfway through the readings a ${dog} called ${dn} comes bombing down the aisle, ears flapping, chased by ${owner ? owner.name : 'its red-faced owner'}. It skids to a halt at ${gN()}'s feet and sits, like it was invited.`, choices: [
      { label: 'Make it an honorary guest', fn() { joy(45); heartsAt(6, 3, 8); memory(`${dn} the wedding dog`, 40); return `${dn} sits patiently through the vows and howls at "you may kiss the bride". Best behaved guest of the day.`; } },
      { label: 'Grab it!', fn() {
        if (chance(0.5)) { joy(20); return `${gN()} dives and scoops it up. The dog licks his face. Applause.`; }
        messNear('mud', 6, 6, 3, 2); joy(35); bliss(-3); return `It does a victory lap of every row first, shaking mud over the front pews. ${nameOr(G.mob, 'Her mum')}'s hat will never be the same.`; } },
      { label: 'Let it be ring bearer', fn() {
        if (chance(0.5)) { joy(60); bliss(4); memory('The dog brought the rings', 50); return `${G.bestMan.name} ties the rings to its collar and it trots them up to the altar. The whole garden melts.`; }
        joy(30); bliss(-4); return `It runs off with the ring cushion. Recovered from under a hedge five minutes later, slightly chewed.`; } },
    ] };
  } },
  { id: 'pageboy', pool: 'ceremony', build() {
    const pb = byRole('Page Boy') || byRole('Flower Girl') || randGuest(p => p.look.kid);
    if (!pb) return null;
    const line = pick([`"MUMMY SAYS ${nameOr(G.gerald, 'UNCLE GERALD').toUpperCase()} WAS DRUNK BEFORE BREAKFAST!"`, `"WHY IS ${gN().toUpperCase()}'S FACE SO RED?"`, `"IS THIS THE BIT WHERE THEY DO KISSING? YUCK!"`, `"I NEED A WEE. A BIG ONE."`, `"GRANDAD SAID HE'D GIVE IT TWO YEARS!"`, `"I DID A PARP!"`]);
    return { title: 'OUT OF THE MOUTHS OF BABES', text: `Right in the quiet bit before the vows, ${pb.name} climbs onto a chair and announces, at full volume: ${line}`, choices: [
      { label: 'Laugh it off', fn() { joy(35); return pick([`The registrar has to stop for a full minute. ${gN()} is wheezing.`, `The whole garden howls. Somebody's mum is mortified. Everyone else is delighted.`]); } },
      { label: 'Bribe them with a Haribo', fn() {
        if (chance(0.7)) { joy(20); return `Silent as a mouse for the rest of the ceremony. The Haribo diplomacy works.`; }
        joy(30); return `They take the Haribo, chew thoughtfully, and announce "THAT WAS A GOOD ONE!" Fair enough.`; } },
      { label: 'Ask them to say something nice', fn() {
        if (chance(0.5)) { joy(55); bliss(5); memory("The page boy's speech", 30); return `"${bN()} is the prettiest lady I ever saw. And ${gN()} is OK too." Not a dry eye in the garden.`; }
        joy(25); bliss(-2); return `"${gN()} has a big head." A long pause. "And big ears." They sit back down, satisfied.`; } },
    ] };
  } },
  { id: 'faint', pool: 'ceremony', build() {
    const g = anyGuest(p => !p.vip);
    const v = weighted([[G.bestMan, isHere(G.bestMan) ? 2 : 0], [G.groom, 1.2], [g, g ? 1.5 : 0]]) || G.groom;
    const isGroom = v === G.groom;
    return { title: 'TIMBER!', text: `It's warm, the readings are long, and ${v.name} has locked their knees. They sway... they wobble... and go down like a felled tree${isGroom ? ` into the arms of ${G.bestMan.name}` : ' into a row of fascinators'}.`, choices: [
      { label: 'Fan them with an order of service', fn() { joy(20); return `Back on their feet in a minute, a bit pink and very embarrassed. Polite applause.`; } },
      { label: isHere(G.babushka) ? `Smelling salts from ${G.babushka.name}'s handbag` : 'Sit them down with some water', fn() {
        if (!isHere(G.babushka)) { joy(20); bliss(2); return `A sit-down, a glass of water and a biscuit from someone's handbag. Right as rain.`; }
        if (chance(0.6)) { joy(45); memory("Babushka's handbag of wonders", 30); return `Her handbag contains smelling salts, a jar of gherkins, a small hammer and a lot of roubles. ${v.name} is revived instantly.`; }
        joy(25); return `The smelling salts are so strong the whole front row starts sneezing. ${v.name} wakes up to a chorus of "bless you".`; } },
      { label: "Carry on, they're fine", fn() {
        if (chance(0.5)) { joy(30); return `They come round just in time for "you may kiss the bride" and cheer from the floor.`; }
        joy(-10); bliss(isGroom ? -6 : -4); return `The registrar refuses to continue until they're seen to. Ten awkward minutes of everyone standing about.`; } },
    ] };
  } },
  { id: 'prankvows', pool: 'ceremony', build() {
    const bm = G.bestMan.name;
    return { title: 'THE VOWS', text: `${gN()} unfolds the vows he left with ${bm} for safekeeping and reads the first line out loud: "I, ${gN()}, promise to love, cherish, and let ${bm} borrow the car whenever he wants..." Those are NOT his vows.`, choices: [
      { label: 'Read them anyway', fn() {
        if (chance(0.5)) { joy(60); memory("The best man's fake vows", 40); return `"...and to name our firstborn ${bm}." The garden is in hysterics. ${bN()} is laughing so hard she has to sit on the altar step.`; }
        joy(15); bliss(-6); return `The prank vows include a line about Prague. ${bN()} is not laughing. ${bm} is suddenly very interested in his shoes.`; } },
      { label: 'Ad-lib some real vows', fn() {
        if (chance(0.55)) { joy(60); bliss(10); memory('Vows from the heart', 50); return `He scrunches up the paper, looks at ${bN()}, and speaks from the heart. Simple and perfect. Not a dry eye.`; }
        joy(25); bliss(3); return `He gets as far as "You are... very... lovely," and the garden melts anyway.`; } },
      { label: `${bN()} goes first instead`, fn() { joy(35); bliss(6); return `${bN()}'s vows are beautiful, and include a binding promise that ${gN()} will never wear that green suit again. He agrees.`; } },
    ] };
  } },
  { id: 'translator', pool: 'ceremony', build() {
    const d = G.dmitri; if (!isHere(d)) return null;
    return { title: 'LOST IN TRANSLATION', text: `The registrar pauses so ${d.name} can translate the vows for the Russian side. He's translating very LOUDLY, and they seem to be getting a much longer version. With hand gestures.`, choices: [
      { label: 'Let him carry on', fn() {
        if (chance(0.55)) { joy(50); memory(`${d.name}'s translation`, 30); return `Every time ${gN()} says a line, the Russian side gasp, then cheer, then laugh. Nobody English will ever know what was promised.`; }
        joy(25); bliss(-3); return `${bN()} hears her uncle's version and turns around: "He did NOT say that!" The Russian side are delighted.`; } },
      { label: `Ask ${nameOr(G.moh, bN() + "'s cousin")} to translate`, fn() { joy(20); bliss(3); d.happy -= 10; return `A calm, accurate translation. ${d.name} mutters that it is "missing the poetry".`; } },
      { label: 'Get him to translate both ways', fn() { joy(45); return `He now translates the Russian side's heckles into English too. Mostly they're shouting "KISS HER ALREADY!" Fair point.`; } },
    ] };
  } },
);

// ---------- spawners used by events ----------
function startRain(mins, storm) {
  G.raining = true; G.rainUntil = G.time + mins; G.storm = !!storm;
  msg(storm ? 'THUNDERSTORM! Everyone into the hall!' : "It's started raining!", 'bad');
  if (storm) for (const p of guests()) if (isOutdoor(Math.floor(p.x), Math.floor(p.y)) && ['idle', 'walk', 'chat', 'dance', 'watch'].includes(p.state)) { interrupt(p); wander(p, 'hall'); }
}
function spawnHens(n) {
  const names = ['Bride-to-be Stacey', 'Hen Tash', 'Hen Leanne', 'Hen Kayleigh', 'Hen Danielle', 'Hen Jade', 'Hen Chantelle', 'Hen Steph'];
  for (let i = 0; i < n; i++) {
    const L = randLook('f', 'adult'); L.sash = true; L.hat = null; if (i === 0) { L.top = '#ffffff'; L.veilL = true; }
    const p = mkPerson('guest', 'Hen Party', names[i % names.length], L);
    p.trait = 'party'; p.drunk = rnd(35, 55); p.evening = true; p.baseSpd = p.spd = 1.5;
    G.people.push(p); G.arrivals.push({ t: G.time + i * 0.7, p });
  }
}
function startConga() {
  const ms = guests().filter(p => ['idle', 'dance', 'chat', 'walk', 'watch'].includes(p.state) && !p.hidden && !isOutdoor(Math.floor(p.x), Math.floor(p.y)));
  if (ms.length < 4) return;
  shuffle(ms);
  const members = ms.slice(0, Math.min(14, ms.length));
  for (const p of members) { interrupt(p); p.state = 'conga'; }
  G.conga = { members, until: G.time + 12, trail: [], target: null };
  const lead = members[0];
  msg(lead.name + ' has started a CONGA LINE!', 'good'); joy(20, true);
  if (members.length >= 10) memory(`A ${members.length}-person conga line`, 40);
}

// =====================================================================
// MORE EVENTS: extra variety so replays don't feel the same
// =====================================================================
EVENTS.push(
  // ----- reception -----
  { id: 'doves', pool: 'reception', build() {
    return { title: 'RELEASE THE DOVES', text: `The photographer has a basket of white doves to release over the couple. ${G.gerald.name} is standing directly underneath.`, choices: [
      { label: 'Release them!', fn() {
        const r = Math.random();
        if (r < 0.45) { joy(55); memory('The dove release', 40); confettiAt(G.groom.x, G.groom.y, 30); return `They soar up in a perfect white cloud. Gasps. Tears. Instagram.`; }
        if (r < 0.8) { joy(40); if (G.gerald.present) G.gerald.happy -= 25; return `Beautiful... except one of them "christens" ${G.gerald.name}'s bald patch.`; }
        joy(30); spawnAnimal('goat', false); return `The doves panic and fly into the farm next door. A goat wanders back in through the gap.`; } },
      { label: 'Use bubbles instead', fn() { joy(25); bliss(3); return `A thousand bubbles drift over the lawn. The kids go feral.`; } },
    ] };
  } },
  { id: 'champagne', pool: 'reception', build() {
    return { title: 'CHAMPAGNE TOWER', text: `The waiters have built a six-foot champagne tower on the lawn. ${gN()} has been handed the bottle to pour.`, choices: [
      { label: 'Pour it slowly', fn() {
        if (chance(0.7)) { joy(45); for (const p of guests()) if (alcoholOK(p)) p.needs.thirst = Math.max(0, p.needs.thirst - 30); return `Glass by glass, it fills perfectly. Free fizz for everyone!`; }
        joy(20); messNear('spill', 7, 15, 4, 2); messNear('litter', 7, 15, 3, 2); return `The tower leans... and leans... CRASH. Two hundred quid of glassware on the lawn.`; } },
      { label: `Let ${G.dmitri.name} pour it`, fn() {
        if (chance(0.5)) { joy(60); memory('Dmitri poured the champagne tower', 40); return `He pours with one hand, holding a vodka in the other. Flawless. The Russian side applaud.`; }
        joy(25); messNear('spill', 7, 15, 5, 3); return `He gets bored halfway and just drinks from the bottle.`; } },
    ] };
  } },
  { id: 'lostkid', pool: 'reception', build() {
    const k = randGuest(p => p.look.kid); if (!k) return null;
    return { title: 'MISSING CHILD!', text: `${k.name} has vanished. Their mum is starting to panic. Everyone is calling their name across the garden.`, choices: [
      { label: 'Search the bouncy castle', fn() { if (countObj('castle')) { joy(30); return `Found them, asleep in a corner of the bouncy castle. Aww.`; } joy(10); return `There is no bouncy castle. They were behind a hedge eating flowers.`; } },
      { label: 'Check under the cake table', fn() { if (chance(0.6)) { joy(35); G.cakeSlices = Math.max(0, G.cakeSlices - 3); return `Under the cake table, with a fistful of icing. The cake has a small handprint now.`; } joy(15); return `Not there. They turn up an hour later, with the goat, very happy.`; } },
      { label: 'Get everyone looking', fn() { joy(20); funAll(-10); return `A full search party. Found in the toilets "having a wee for ages". Big cheer.`; } },
    ] };
  } },
  { id: 'wind', pool: 'reception', cond: () => G.weather !== 'Scorching', build() {
    return { title: 'GUST OF WIND', text: `A sudden gust whips across the lawn. Fascinators are taking flight. ${bN()}'s veil is doing its best kite impression.`, choices: [
      { label: 'Chase the hats!', fn() { joy(35); funAll(-15); return `Twenty guests sprinting across the lawn after flying hats. Best entertainment of the day.`; } },
      { label: 'Everyone inside for a bit', fn() { joy(5); for (const p of guests()) if (isOutdoor(Math.floor(p.x), Math.floor(p.y)) && ['idle', 'walk', 'chat'].includes(p.state)) { interrupt(p); wander(p, 'hall'); } return `Hair saved. Mostly.`; } },
      { label: 'Use the veil for a dramatic photo', fn() { if (chance(0.6)) { joy(55); bliss(4); memory('The windswept veil photo', 40); return `The photographer gets THE shot. It'll be framed in every house in the family.`; } joy(20); bliss(-2); return `The veil wraps round ${gN()}'s head. He walks into a hedge.`; } },
    ] };
  } },
  { id: 'magic', pool: 'reception', cond: () => G.magician && G.magician.present, build() {
    return { title: 'NOW YOU SEE IT...', text: `The Great Mysterio has borrowed ${bN()}'s wedding ring for his big finale. He waves his hand... and it's gone.`, choices: [
      { label: 'Applaud!', fn() { if (chance(0.6)) { joy(50); memory('The magic ring trick', 40); return `It reappears inside a bread roll in ${nameOr(G.mob, 'an auntie')}'s handbag. How?! HOW?!`; } bliss(-8); joy(10); return `It does not reappear. He looks genuinely worried. It turns up in the hedge an hour later.`; } },
      { label: 'Demand it back NOW', fn() { joy(10); return `He produces it from behind your ear, looking a bit hurt.`; } },
    ] };
  } },
  // ----- dinner -----
  { id: 'candle', pool: 'dinner', build() {
    return { title: 'FIRE!', text: `A centrepiece candle has set the flowers on table three alight. It's only small. For now.`, choices: [
      { label: 'Throw water on it', fn() { joy(15); messNear('spill', 16, 5, 3, 1); return `Out in one splash. Also soaked: three aunties.`; } },
      { label: 'Smother it with a napkin', fn() { if (chance(0.7)) { joy(25); return `Swift, calm, heroic. A round of applause for the napkin.`; } joy(10); bliss(-3); messNear('litter', 16, 5, 3, 1); return `The napkin catches fire too. Then the second napkin.`; } },
      { label: 'Toast marshmallows on it', fn() { joy(40); memory('Marshmallows over a burning centrepiece', 40); return `${G.dmitri.name} produces marshmallows from his jacket. Nobody asks why.`; } },
    ] };
  } },
  { id: 'allergy', pool: 'dinner', build() {
    const g = anyGuest(); if (!g) return null;
    return { title: 'NUT ALERT', text: `${g.name} has just realised the sauce might have nuts in. They're allergic. They're looking at you.`, choices: [
      { label: 'Ask the kitchen', fn() { if (chance(0.7)) { joy(15); return `No nuts. Panic over. They eat two portions out of relief.`; } g.happy -= 20; joy(5); return `There were nuts. Mild reaction. A cousin who's a nurse handles it like a pro.`; } },
      { label: 'Swap their plate to be safe', fn() { joy(20); g.happy += 10; return `A safe plate arrives in record time. Gold star for the kitchen.`; } },
    ] };
  } },
  { id: 'seatwar', pool: 'dinner', build() {
    const a = anyGuest(p => p.look.dress), b = anyGuest(p => p.look.dress && p !== a); if (!a || !b) return null;
    return { title: 'SEATING PLAN WAR', text: `${a.name} has discovered she's sat next to ${b.name}. They haven't spoken since "the incident" at a christening in 2011.`, choices: [
      { label: 'Swap their seats quietly', fn() { joy(15); return `Crisis averted. Nobody will ever know about the incident. (Everyone knows about the incident.)`; } },
      { label: 'Make them sit together', fn() { if (chance(0.5)) { joy(50); memory('The great reconciliation', 50); return `By dessert they're crying, hugging and sharing a bottle of wine. Healing!`; } a.happy -= 30; b.happy -= 30; joy(5); return `Forty minutes of very loud silence. Then a bread roll is thrown.`; } },
    ] };
  } },
  { id: 'babtoast', pool: 'dinner', build() {
    const b = G.babushka; if (!b || !b.present) return null;
    return { title: 'BABUSHKA STANDS UP', text: `${b.name} rises, raises a shot glass and begins a toast in Russian. It's been going for five minutes. Nobody on the British side has a clue what's happening.`, choices: [
      { label: `Ask ${bN()} to translate`, fn() { if (chance(0.6)) { joy(45); bliss(6); memory("Babushka's toast", 40); return `"She says... she has waited 84 years to see this, and she approves of ${gN()}." Everyone weeps.`; } joy(30); return `"She says the groom is too skinny and needs feeding." The Russian side nod firmly.`; } },
      { label: 'Just clap at the end', fn() { joy(20); b.happy += 10; return `Enthusiastic applause. She looks pleased. Nobody will ever know what she said.`; } },
      { label: 'Everyone drink when she drinks', fn() { joy(35); for (const p of guests()) if (alcoholOK(p)) p.drunk += 12; return `Four shots later, the British side are ready to learn Russian.`; } },
    ] };
  } },
  // ----- party -----
  { id: 'ymca', pool: 'party', cond: () => G.djOn, build() {
    return { title: 'Y.M.C.A!', text: `The DJ drops the YMCA. A primal force takes over the room. Even ${G.mob.name} is twitching.`, choices: [
      { label: 'Everyone on the floor!', fn() { for (const p of guests()) if (['idle', 'chat', 'walk'].includes(p.state) && chance(0.7)) { interrupt(p); goDance(p); } funAll(-40); joy(45); return `Forty people spelling out letters with varying accuracy. Uncle Gerald does a "W".`; } },
      { label: 'Couple-only verse', fn() { joy(30); bliss(5); heartsAt(19.5, 16.5, 10); return `${gN()} and ${bN()} do the whole thing in sync. They have clearly practised.`; } },
    ] };
  } },
  { id: 'limbo', pool: 'party', build() {
    const g = anyGuest(p => p.look.sex === 'f' && !p.look.kid); if (!g) return null;
    return { title: 'HOW LOW CAN YOU GO?', text: `Someone has found a broom and started a limbo contest. ${g.name} has rolled up her sleeves.`, choices: [
      { label: `Back ${g.name}!`, fn() { if (chance(0.5)) { joy(60); memory(`${g.name} won the limbo`, 50); return `Under the bar at knee height. The crowd chants her name.`; } fall(g); joy(30); return `She gets halfway, freezes, and has to be lifted out by two cousins.`; } },
      { label: 'Lower the bar for the kids', fn() { joy(30); for (const p of guests()) if (p.look.kid) p.happy += 15; return `The kids dominate. Total limbo legends.`; } },
    ] };
  } },
  { id: 'karaoke', pool: 'party', build() {
    const g = anyGuest(p => p.drunk > 30) || anyGuest(); if (!g) return null;
    return { title: 'KARAOKE', text: `${g.name} has found the karaoke machine and is scrolling ominously towards "My Heart Will Go On".`, choices: [
      { label: 'Let them belt it out', fn() { if (chance(0.4)) { joy(60); memory(`${g.name}'s Titanic moment`, 40); return `They hit THE note. Grown men weep. Someone holds ${bN()} at the front of the "ship".`; } funAll(10); joy(15); return `It's not good. It's really not good. But it's very, very loud.`; } },
      { label: 'Steer them to a duet', fn() { joy(35); return `"Islands in the Stream" with ${G.bestMan.name}. Unexpectedly tender.`; } },
      { label: 'Pull the plug', fn() { g.happy -= 25; joy(5); return `They sing it anyway, a cappella, on a chair.`; } },
    ] };
  } },
  { id: 'stag', pool: 'party', build() {
    return { title: 'THE STAG LADS', text: `${gN()}'s stag do mates have arrived wearing the same inflatable costumes from Prague. They're carrying something large under a sheet.`, choices: [
      { label: 'Reveal it!', fn() { if (chance(0.5)) { joy(55); memory('The stag do surprise', 40); return `It's a cardboard cut-out of ${gN()} from the stag. In a mankini. ${bN()} laughs so hard she cries.`; } bliss(-6); joy(20); return `It's a photo board from Prague. ${G.mob.name} has seen it. She has questions.`; } },
      { label: 'Make them dance first', fn() { joy(35); funAll(-20); return `Six inflatable dinosaurs doing the Macarena. Peak wedding.`; } },
    ] };
  } },
  { id: 'lostring', pool: 'party', build() {
    return { title: 'THE RING!', text: `${gN()} was showing off his ring and it's slipped off and rolled somewhere across the dance floor.`, choices: [
      { label: 'Stop the music and search', fn() { if (chance(0.6)) { joy(25); return `Found within two minutes. The DJ restarts with "Single Ladies". Cheeky.`; } bliss(-8); joy(10); return `Ten minutes, no ring. ${bN()} finds it in his own pocket.`; } },
      { label: `Send ${nameOr(G.jess, 'the kids')} to find it`, fn() { joy(40); memory('The great ring hunt', 40); return isHere(G.jess) ? `${G.jess.name} finds it in seconds using her phone torch, and livestreams the whole rescue. 40k likes.` : `The kids find it in seconds. They demand a finder's fee in Haribo.`; } },
    ] };
  } },
  { id: 'brideoff', pool: 'party', cond: () => G.twist && G.twist.id === 'rival', weight: 3, build() {
    return { title: 'BRIDE-OFF!', text: `The bride from the OTHER wedding has marched over and declared their party "way better". She's challenging ${bN()} to a dance-off.`, choices: [
      { label: `${bN()} accepts!`, fn() { if (chance(0.6)) { joy(80); bliss(8); memory('Won the Bride-Off', 70); return `${bN()} wins by a mile, dark pink shoes flashing. The other bride concedes and buys her a drink.`; } joy(30); bliss(-5); return `It's close. Too close. The judges (the DJ) call it a draw.`; } },
      { label: 'Kill them with kindness', fn() { joy(40); bliss(4); return `${bN()} invites them all in for cake. Two weddings become one massive party.`; } },
      { label: hasBouncer() ? 'Bouncer, show them out' : 'Bouncer! (you have none)', fn() { if (hasBouncer()) { for (const p of G.people) if (p.rival && p.present) { interrupt(p); leave(p, 'done'); } joy(20); return `Escorted back to their own wedding. Order restored.`; } bliss(-4); return `No bouncer. They stay and judge your canapés.`; } },
    ] };
  } },
);

// ---------- twist & special scripted events ----------
function evFlashmob() {
  const music = G.djOn;
  return { title: 'FLASH MOB!', text: `It's 20:00. ${G.moh.name} gives the signal. The bridesmaids freeze, then ${music ? 'the DJ drops the beat' : "there's... no music. Someone's phone speaker crackles"}...`, choices: [
    { label: 'GO GO GO!', fn() {
      for (const p of guests()) if (['idle', 'chat', 'walk'].includes(p.state) && chance(0.6)) { interrupt(p); goDance(p); }
      if (music && chance(0.8)) { joy(120); bliss(10); memory('The surprise flash mob', 90); return `Twenty people burst into a perfectly choreographed routine. ${bN()} is screaming. ${gN()} is crying. LEGENDARY.`; }
      joy(40); return `It starts strong, then half of them forget the moves. Still brilliant.`; } },
    { label: 'Pull the groom in too', fn() { joy(70); bliss(6); return `${gN()} doesn't know any of the moves. He commits anyway. The crowd loves him.`; } },
  ] };
}
function evBirthday() {
  const b = isHere(G.bestMan) ? G.bestMan : isHere(G.bestMan2) ? G.bestMan2 : G.groom;
  return { title: b.name.toUpperCase() + ' TURNS 30', text: `It's also ${b.name}'s 30th birthday today. He's propping up the bar, pretending he doesn't mind that nobody has said anything.`, choices: [
    { label: 'Whole room sings Happy Birthday', fn() { joy(50); bliss(6); b.happy = 100; heartsAt(b.x, b.y, 12); memory(`${b.name}'s 30th birthday song`, 50); return `In English AND Russian. He pretends to be embarrassed, then stands on a chair and conducts.`; } },
    { label: 'Birthday shots for the stag lads', fn() { joy(45); b.drunk += 30; for (const p of guests()) if (p.trait === 'party' && chance(0.5)) p.drunk += 15; return `Thirty shots, lined up on the bar. Nobody is entirely sure who drank the last ten.`; } },
    { label: 'Give him cake with a candle in it', fn() { if (G.cakeEaten || (G.cakeCut && G.cakeSlices <= 0)) { joy(10); return `There's no cake left. He gets a candle in a sausage roll. He's thrilled.`; } G.cakeSlices = Math.max(0, G.cakeSlices - 2); joy(40); bliss(4); b.happy += 30; return `He blows it out and gives a surprisingly emotional speech about turning thirty. ${gN()} hugs him.`; } },
    { label: "Don't make a fuss", fn() { b.happy = 10; bliss(-8); joy(-20); return `He sulks. Loudly. ${gN()} spends the rest of the night apologising.`; } },
  ] };
}
// ---------- Cousin Jess, the influencer (the 'Live-Streamed Wedding' twist) ----------
function evJessLive() {
  const j = G.jess; if (!isHere(j)) return null;
  return { title: 'GOING LIVE', text: `${j.name} has set up a ring light on the lawn. "Hiii guys! I'm LIVE from my cousin's wedding!" She wants ${gN()} and ${bN()} for a quick Q&A with her 200,000 followers.`, choices: [
    { label: 'Do the Q&A', fn() { if (chance(0.6)) { joy(45); bliss(3); memory('The wedding went viral', 40); return `${bN()} is a natural. ${gN()} says "hashtag blessed" unironically. 300 new followers.`; } joy(15); bliss(-4); return `Someone asks ${gN()} how much the wedding cost. Live. He tells them.`; } },
    { label: 'Agree a sponsored prosecco deal (+£300)', fn() { cash(300); joy(15); bliss(-4); return `Every glass now has to be held label-out for the camera. The prosecco is fine. The vibe is "advert".`; } },
    { label: 'Phones away, please', fn() { j.happy -= 40; bliss(4); return `${j.name} posts a sad selfie captioned "some people just don't get content". Everyone else enjoys the day.`; } },
  ] };
}
function evJessFuse() {
  const j = G.jess; if (!isHere(j)) return null;
  return { title: 'RING LIGHT BLACKOUT', text: `${j.name} has plugged her ring light, two phones, a laptop and a hair straightener into one socket. There's a bang. The hall goes dark.`, choices: [
    { label: 'Call an emergency electrician (£150)', fn() { cash(-150); joy(10); return `Lights back on in ten minutes. The electrician stays for a slice of cake.`; } },
    { label: 'Candlelit, it is', fn() { if (chance(0.6)) { joy(40); bliss(6); memory('The candlelit wedding breakfast', 40); return `Candles on every table. It looks stunning. ${j.name} says it's "giving cottagecore".`; } joy(10); bliss(-3); G.shake = 0.3; return `Someone's sleeve catches a candle. It's fine. It's mostly fine.`; } },
    { label: 'Make her fix it', fn() { j.happy -= 20; joy(25); return `${j.name} fixes it with a hair grip and a lot of confidence. Nobody asks how.`; } },
  ] };
}
function evJessViral() {
  const j = G.jess; if (!isHere(j)) return null;
  return { title: 'GOING VIRAL', text: `${j.name} screams. The stream just hit A MILLION viewers. People all over the world are watching ${gN()}'s dancing. She wants to give them something special.`, choices: [
    { label: 'Start a wedding dance challenge', fn() { joy(60); funAll(30); for (const p of guests()) if (p.state === 'idle' && chance(0.7)) goDance(p); memory('The viral dance challenge', 50); return `Eighty guests doing the same dance. It's trending in four countries by midnight.`; } },
    { label: 'Shout out a sponsor (+£400)', fn() { cash(400); joy(10); bliss(-5); return `${gN()} reads out a discount code for teeth-whitening strips in the middle of his own wedding.`; } },
    { label: 'End the stream. Be in the moment.', fn() { bliss(8); joy(20); j.happy -= 10; return `${j.name} turns the camera off, puts her phone in her bag and dances with everyone. Best decision of the night.`; } },
  ] };
}
function evPaparazzi() {
  return { title: 'PAPARAZZI!', text: `Photographers have spotted TV Chef Rocco Bellini and are climbing over the hedge with long lenses. One is already on the bouncy castle.`, choices: [
    { label: hasBouncer() ? 'Bouncer, clear them out' : 'Bouncer! (you have none)', fn() { if (hasBouncer()) { joy(30); return `Bounced out of the garden. Rocco is so grateful he gives a speech about the canapés.`; } joy(-20); messNear('mud', 6, 16, 3, 3); return `No bouncer. They trample the flowerbeds and get a shot of Uncle Gerald being sick.`; } },
    { label: 'Sell them an exclusive (+£500)', fn() { cash(500); bliss(-6); joy(20); return `Your wedding will be in a magazine next week. ${bN()} is NOT pleased about her photo.`; } },
    { label: "Let 'em in", fn() { joy(40); memory('Our wedding made the papers', 40); return `They have a lovely time. One of them catches the bouquet later.`; } },
  ] };
}
