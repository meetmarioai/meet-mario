// MediBalans Email Templates - 5-step onboarding to ALCAT conversion sequence

var BASE_STYLE = "font-family:'Georgia',serif;background:#FAF8F4;color:#2C2C2C;max-width:600px;margin:0 auto;padding:0;";

function HEADER(subtitle) {
  return '<div style="background:#FAF8F4;padding:40px 48px 24px;border-bottom:1px solid #E8E0D4;">' +
    '<div style="font-family:Georgia,serif;font-size:22px;letter-spacing:0.04em;color:#2C2C2C;">meet <span style="color:#C4887A;">&#9673;</span> mario</div>' +
    '<div style="font-family:Georgia,serif;font-size:13px;color:#9A7240;margin-top:4px;letter-spacing:0.06em;">MediBalans AB &mdash; Precision Medicine</div>' +
    (subtitle ? '<div style="margin-top:16px;font-size:13px;color:#888;letter-spacing:0.08em;text-transform:uppercase;">' + subtitle + '</div>' : '') +
    '</div>';
}

var FOOTER = '<div style="background:#F2EDE6;padding:32px 48px;margin-top:48px;border-top:1px solid #E8E0D4;">' +
  '<div style="font-size:12px;color:#999;line-height:1.8;">MediBalans AB &bull; Stockholm, Sweden<br>' +
  '<a href="https://meet-mario.vercel.app" style="color:#9A7240;text-decoration:none;">meet-mario.vercel.app</a>' +
  ' &bull; info@medibalans.se<br><br>' +
  'You are receiving this because you enrolled in the MediBalans clinical programme. To unsubscribe, reply with "unsubscribe".' +
  '</div></div>';

function P(text) {
  return '<p style="font-size:15px;line-height:1.8;color:#2C2C2C;margin:0 0 18px;">' + text + '</p>';
}

function H2(text) {
  return '<h2 style="font-family:Georgia,serif;font-size:20px;color:#2C2C2C;margin:0 0 20px;font-weight:normal;">' + text + '</h2>';
}

function GOLD_BOX(content) {
  return '<div style="background:#FDF6EC;border-left:3px solid #9A7240;padding:20px 24px;margin:28px 0;border-radius:2px;">' +
    '<div style="font-size:14px;line-height:1.8;color:#5C4A2A;">' + content + '</div></div>';
}

function CTA(text, url) {
  return '<div style="margin:36px 0;"><a href="' + url + '" style="background:#9A7240;color:#FAF8F4;text-decoration:none;padding:14px 32px;font-size:14px;letter-spacing:0.06em;font-family:Georgia,serif;display:inline-block;border-radius:2px;">' + text + '</a></div>';
}

function FOOD_LIST(foods) {
  return foods.map(function(f) {
    return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #E8E0D4;font-size:13px;">' +
      '<span style="color:#2C2C2C;">' + f.name + '</span>' +
      '<span style="color:#C4887A;font-size:12px;">' + f.severe + '% severe &bull; n=' + f.n + '</span>' +
      '</div>';
  }).join('');
}

function WRAP(header, body) {
  return '<!DOCTYPE html><html><body style="' + BASE_STYLE + '">' + header + '<div style="padding:40px 48px;">' + body + '</div>' + FOOTER + '</body></html>';
}

export function template0(opts) {
  var name = opts.name || 'there';
  var predictedReactors = opts.predictedReactors || [];
  var symptomProfile = opts.symptomProfile || {};
  var firstName = name.split(' ')[0];
  var topFoods = predictedReactors.slice(0, 5);
  var symptoms = (symptomProfile.symptoms || []).join(', ');

  var foodHtml = topFoods.length > 0
    ? '<div style="margin:24px 0;"><div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#9A7240;margin-bottom:12px;">Predicted high-reactivity foods</div>' +
      FOOD_LIST(topFoods) +
      '<div style="font-size:11px;color:#999;margin-top:8px;">Source: MediBalans ALCAT population database</div></div>'
    : '';

  var body = H2('Welcome to MediBalans, ' + firstName + '.') +
    P('Your intake is complete. I have reviewed your symptom profile and cross-referenced it against our database of 1,042 ALCAT patient reports from our Swedish functional medicine practice.') +
    P('Based on your reported symptoms' + (symptoms ? ' &mdash; ' + symptoms + ' &mdash;' : '') + ' and demographic profile, here are the foods most likely to be driving your immune burden:') +
    foodHtml +
    GOLD_BOX('These are population-level predictions, not your personal results. 23% of patients with your symptom profile have severe reactions to foods not on this list. The only way to know your precise biology is through ALCAT testing.') +
    P('Starting today, I recommend beginning the universal 21-day anti-inflammatory protocol. Eliminate seed oils, sugar, yeast, and dairy immediately. This prepares your immune system and will show results within two weeks.') +
    P('I will check in with you in two days.') +
    P('Mario Anthis, MD<br><span style="font-size:12px;color:#888;">Functional Medicine &bull; MediBalans AB</span>');

  return {
    subject: 'Your MediBalans clinical profile is ready, ' + firstName,
    sender: { name: 'MediBalans', email: 'info@medibalans.se' },
    html: WRAP(HEADER('Day 0 &mdash; Your Clinical Profile'), body)
  };
}

export function template1(opts) {
  var name = opts.name || 'there';
  var firstName = name.split(' ')[0];

  var body = H2(firstName + ', checking in.') +
    P('It has been two days since you started the universal elimination protocol. This is typically when patients notice the first shifts &mdash; sometimes a brief worsening before improvement, sometimes early clarity.') +
    P('What you are experiencing right now is your immune system beginning to reduce its baseline inflammatory load. The seed oils and sugar removal alone can cause measurable changes in cellular membrane integrity within 48 hours.') +
    GOLD_BOX('<strong>This week, focus on:</strong><br>' +
      '&bull; Tallow or coconut oil for all cooking<br>' +
      '&bull; A protein source at every meal<br>' +
      '&bull; No snacking between meals &mdash; blood glucose stability is the foundation<br>' +
      '&bull; Note any symptoms that worsen or improve') +
    P('If you have questions about what to eat, the Meet Mario assistant on your patient dashboard can generate meal ideas and grocery lists in real time.') +
    CTA('Open your dashboard', 'https://meet-mario.vercel.app/dashboard') +
    P('Christina Biri<br><span style="font-size:12px;color:#888;">Clinical Coordinator &bull; MediBalans AB</span>');

  return {
    subject: 'Day 2 &mdash; how are you feeling?',
    sender: { name: 'MediBalans', email: 'info@medibalans.se' },
    html: WRAP(HEADER('Day 2 &mdash; Protocol Check-in'), body)
  };
}

export function template2(opts) {
  var name = opts.name || 'there';
  var predictedReactors = opts.predictedReactors || [];
  var firstName = name.split(' ')[0];
  var topFood = predictedReactors[0];

  var gapText = topFood
    ? 'The universal protocol removes the most common immune triggers. But in our patient population, <strong>' + topFood.name + '</strong> drives severe reactions in ' + topFood.severe + '% of patients &mdash; individual reactivity patterns vary enormously. Two patients with identical symptoms can have completely different ALCAT profiles. Without your test, we are optimising for the population, not for you.'
    : 'The universal protocol removes the most common immune triggers. But individual reactivity patterns vary enormously. Two patients with identical symptoms can have completely different ALCAT profiles. Without your test, we are optimising for the population, not for you.';

  var body = H2('One week.') +
    P('You have completed the first week of the universal protocol. If you have been consistent, you should be noticing improvements in energy, sleep quality, or digestive comfort &mdash; these are the first signals of reduced immune burden.') +
    P('But here is what we still do not know about your biology.') +
    GOLD_BOX(gapText) +
    P('The patients who see the most dramatic results &mdash; resolution of chronic symptoms, sustained weight normalisation, cognitive clarity &mdash; are those who combine the universal protocol with their personal ALCAT data.') +
    P('The test takes 10 minutes of blood draw. Results in 10 days. Your protocol becomes precise.') +
    CTA('Book your ALCAT test', 'https://meet-mario.vercel.app/dashboard') +
    P('Mario Anthis, MD<br><span style="font-size:12px;color:#888;">Functional Medicine &bull; MediBalans AB</span>');

  return {
    subject: 'One week in &mdash; your results so far',
    sender: { name: 'MediBalans', email: 'info@medibalans.se' },
    html: WRAP(HEADER('Day 7 &mdash; First Results'), body)
  };
}

export function template3(opts) {
  var name = opts.name || 'there';
  var predictedReactors = opts.predictedReactors || [];
  var firstName = name.split(' ')[0];
  var foods = predictedReactors.slice(0, 8);

  var foodHtml = foods.length > 0
    ? '<div style="margin:24px 0;"><div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#9A7240;margin-bottom:12px;">Your predicted reactivity profile</div>' +
      FOOD_LIST(foods) + '</div>'
    : '';

  var body = H2('Two weeks. Time to go deeper.') +
    P('You have done the universal work. Now I want to show you what our clinical database predicts about your specific biology.') +
    P('These are the foods that our 1,042-patient ALCAT database flags as highest risk for patients with your profile:') +
    foodHtml +
    GOLD_BOX('These foods may be continuing to drive inflammation even on your current protocol. Without ALCAT confirmation, we cannot safely recommend eliminating all of them &mdash; but we also cannot rule them out.') +
    P('The ALCAT test costs less than two months of supplements that may be working against reactive foods still in your diet. It is the most precise investment you can make in this protocol.') +
    P('Book before the end of this week. I will personally review your results and build your precision protocol.') +
    CTA('Book your ALCAT test now', 'https://meet-mario.vercel.app/dashboard') +
    P('Mario Anthis, MD<br><span style="font-size:12px;color:#888;">Functional Medicine &bull; MediBalans AB</span>');

  return {
    subject: 'What 1,042 patients tell us about your biology',
    sender: { name: 'MediBalans', email: 'info@medibalans.se' },
    html: WRAP(HEADER('Day 14 &mdash; Your Population Report'), body)
  };
}

export function template4(opts) {
  var name = opts.name || 'there';
  var firstName = name.split(' ')[0];

  var body = H2(firstName + ', you did the hard part.') +
    P('Twenty-one days. You removed the universal triggers, stabilised your blood sugar, and gave your gut lining its first real recovery window. That is not small. Most people never get this far.') +
    P('But the protocol you just completed is the foundation, not the destination.') +
    GOLD_BOX('<strong>What happens without ALCAT:</strong><br>' +
      'You reintroduce foods over the next weeks. Some of them will be your personal immune triggers. Without knowing which ones, the inflammation rebuilds &mdash; slowly, silently &mdash; and six months from now you are back where you started.<br><br>' +
      '<strong>What happens with ALCAT:</strong><br>' +
      'You know exactly which foods to avoid and for how long. Your protocol becomes a 9-month precision map. The results you felt in 21 days become permanent.') +
    P('Book your ALCAT test this week. You have already done the preparation. The test is the next step.') +
    CTA('Complete your protocol &mdash; book ALCAT', 'https://meet-mario.vercel.app/dashboard') +
    P('Christina Biri<br><span style="font-size:12px;color:#888;">Clinical Coordinator &bull; MediBalans AB</span>');

  return {
    subject: 'You completed the 21-day protocol. What comes next.',
    sender: { name: 'MediBalans', email: 'info@medibalans.se' },
    html: WRAP(HEADER('Day 21 &mdash; Protocol Complete'), body)
  };
}

export var SEQUENCE_SCHEDULE = [
  { step: 0, daysOffset: 0,  template: template0, label: 'Welcome + Statistical Profile' },
  { step: 1, daysOffset: 2,  template: template1, label: 'Day 2 Protocol Check-in' },
  { step: 2, daysOffset: 7,  template: template2, label: 'Day 7 First Results + Gap' },
  { step: 3, daysOffset: 14, template: template3, label: 'Day 14 Population Reveal' },
  { step: 4, daysOffset: 21, template: template4, label: 'Day 21 Protocol Complete' },
];
