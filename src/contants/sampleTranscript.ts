export const TEST_SAMPLE_TRANSCRIPT = `
  I've been feeling really overwhelmed lately, especially with work. It feels like I'm constantly behind, and no matter how hard I try, I can't seem to catch up. It's starting to affect my sleep and even my relationships at home. 
  
  The pressure just keeps building, and I'm not sure how much more I can handle before something gives. Every time I think I'm getting a handle on things, something else gets added to my plate. 
  
  I've tried a few things to manage the stress, like setting stricter boundaries around work hours, but I always end up working late or taking calls at odd hours. I want to be able to disconnect, but it's like my brain is constantly going, even when I'm supposed to be relaxing.
  
  Sometimes, it feels like I'm just not doing enough or that I'm not good enough to handle my responsibilities. I look around at others who seem to be managing just fine, and it makes me feel inadequate.
  
  I've been reflecting a lot on how I got here and wondering if I made a mistake somewhere along the way. I used to love my job, but now it just feels like a burden. I don't know if it's the workload or if something in me has changed, but it's like I'm losing a part of myself.
  
  Another thing that's been on my mind is my relationship with my family. I want to be present when I'm with them, but my mind is often somewhere else, worrying about tasks I left unfinished. It's hard because I know they can sense my stress, and I hate that it's affecting them too.
  
  There was a moment last weekend when my child asked me to play, and I said, “Maybe later.” But then I got so wrapped up in work that I forgot. The look on their face when they realized I wasn't going to make time really got to me. It's moments like that that make me question my priorities.
  
  I've tried some breathing exercises and even started journaling to get my thoughts out, but it's hard to stay consistent. Some days it helps, but other days I just feel like I'm going through the motions without any real benefit.
  
  Sometimes I wonder if I should be looking for another job or if that's just a way of running from the problem. I don't want to make any drastic decisions while I'm feeling like this, but I also don't want to feel stuck forever.
  
  And then there are days where I feel a bit better, like maybe I can handle things if I just push through. But those days feel rare compared to the weight I carry most of the time. I keep telling myself that everyone goes through phases, and maybe this is just one of them.
  
  One thing I am grateful for is my family's support. Even though I don't always express it, knowing they're there for me is a comfort. I don't want to take that for granted, but I also don't want to keep putting them in the position where they have to pick up the pieces when I'm struggling.
  
  In the back of my mind, I worry that this stress will eventually turn into something more serious, like burnout. I've read about how it can creep up on you, and I see some of those signs in myself, like the lack of enthusiasm and the constant feeling of being drained. I want to avoid reaching that point, but I don't know how to shift things enough to prevent it.
  
  I think if I could just find a way to balance work and personal life better, I'd feel more like myself again. I miss feeling engaged with my work and connected with my family without this cloud hanging over me all the time. It's just hard to know where to start, and I'm not sure if I can do it alone.
  `;

export const TEST_SAMPLE_SENTIMENT_ANALYSIS = [
  {
    content:
      "I've been feeling really overwhelmed lately, especially with work.",
    score: -0.7,
    sentiment: "negative",
    ts: 0,
    end_ts: 4,
  },
  {
    content:
      "The pressure just keeps building, and I’m not sure how much more I can handle before something gives.",
    score: -0.65,
    sentiment: "negative",
    ts: 5,
    end_ts: 10,
  },
  {
    content:
      "I’ve tried a few things to manage the stress, like setting stricter boundaries around work hours.",
    score: 0.1,
    sentiment: "neutral",
    ts: 11,
    end_ts: 15,
  },
  {
    content:
      "Sometimes, it feels like I’m just not doing enough or that I'm not good enough to handle my responsibilities.",
    score: -0.8,
    sentiment: "negative",
    ts: 16,
    end_ts: 20,
  },
  {
    content: "I used to love my job, but now it just feels like a burden.",
    score: -0.6,
    sentiment: "negative",
    ts: 21,
    end_ts: 24,
  },
  {
    content:
      "Another thing that’s been on my mind is my relationship with my family.",
    score: -0.5,
    sentiment: "negative",
    ts: 25,
    end_ts: 28,
  },
  {
    content:
      "There was a moment last weekend when my child asked me to play, and I said, “Maybe later.”",
    score: -0.7,
    sentiment: "negative",
    ts: 29,
    end_ts: 32,
  },
  {
    content:
      "I’ve tried some breathing exercises and even started journaling to get my thoughts out.",
    score: 0.2,
    sentiment: "neutral",
    ts: 33,
    end_ts: 36,
  },
  {
    content: "Sometimes I wonder if I should be looking for another job.",
    score: -0.4,
    sentiment: "negative",
    ts: 37,
    end_ts: 39,
  },
  {
    content: "One thing I am grateful for is my family’s support.",
    score: 0.7,
    sentiment: "positive",
    ts: 40,
    end_ts: 42,
  },
  {
    content:
      "I keep telling myself that everyone goes through phases, and maybe this is just one of them.",
    score: 0.3,
    sentiment: "neutral",
    ts: 43,
    end_ts: 46,
  },
  {
    content:
      "I think if I could just find a way to balance work and personal life better, I’d feel more like myself again.",
    score: 0.4,
    sentiment: "positive",
    ts: 47,
    end_ts: 50,
  },
];
