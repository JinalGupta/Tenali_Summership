-- ═══════════════════════════════════════════════════════════════
-- TENALI SEED DATA — All 7 Case Studies, 43 Stages, 387 Questions
-- Run AFTER schema.sql
-- ═══════════════════════════════════════════════════════════════

-- ── CASE STUDIES ─────────────────────────────────────────────
INSERT INTO case_studies (title, core_idea, story_intro, real_world) VALUES

(1, 'Fermat''s Little Theorem',
'Powers of numbers cycle in predictable patterns under prime moduli — a shortcut for impossibly large calculations.',
'"Priya is a cryptographer at a startup. She needs to verify whether a gigantic number — too big for any calculator — leaves a specific remainder when divided by a prime. Her senior says there is a shortcut. Priya does not believe it. Let''s show her — step by step."',
ARRAY['RSA encryption underpins internet security. It uses properties like a^p ≡ a (mod p).','Credit card verification uses prime modulus arithmetic to check signatures without exposing secrets.','Google''s search ranking algorithms use modular arithmetic in distributed hash systems.']),

(2, 'The Handshake Problem',
'Pairs form combinations — n(n-1)/2 handshakes connect n people in a room, no matter how you count it.',
'"At a board meeting, the 10 directors decide each person will shake hands with everyone else exactly once. One director is exhausted just thinking about it. But there is a formula — and a beautiful way to see why it works."',
ARRAY['Organising a round-robin tournament: 20 teams, each plays every other once — how many total matches?','Social network analysis: how many connections exist in a group of 1000 users where everyone is friends with everyone else.','Conference networking: 50 attendees, each exchanges cards with all others — how many card exchanges happen?']),

(3, 'Chinese Remainder Theorem',
'When remainders from different divisors矛盾 — there is always a unique number that satisfies them all simultaneously.',
'"In ancient China, a general counted his soldiers by having them stand in rows of 3, then 5, then 7. Each time, a different number remained. From this, he knew exactly how many men he had — without counting them one by one."',
ARRAY['Synchronising traffic lights that cycle on different intervals — finding a green light that works for all.','Ancient Chinese calendar calculations that combined lunar and solar cycles into one unified date system.','Distributed computing: coordinating tasks across processors running on different cycle times.']),

(4, 'Coupon Collector Problem',
'Collecting the last few coupons takes disproportionately longer than the first half — a counterintuitive truth about randomness.',
'"Ananya is collecting cricket cards. There are 10 different cards in each pack. She already has 8. How many more packs does she need before she gets the last 2? It could be 2 packs — or 200. Probability tells us the average."',
ARRAY['Pokémon games: collecting all 151 Pokémon requires catching some repeatedly — the last ones are hardest.','Quality control in manufacturing: detecting all possible defects requires more samples than the number of defect types.','Completing a museum stamp rally: the last few stamps always take longest to collect.']),

(5, 'Euclidean Algorithm',
'The ancient algorithm for finding GCD: divide, take remainder, repeat — until the remainder is zero. Simple, powerful, and still used in cryptography.',
'"Two merchants want to divide their profits fairly but keep getting confused about shared inventory. An old mathematician points out a trick: keep subtracting the smaller from the larger, and what remains is what they share."',
ARRAY['Lock combinations: the algorithm determines the greatest common divisor of lock numbers for master key systems.','Simplifying fractions: 252/105 becomes 12/5 using the Euclidean Algorithm.','Cryptography: GCD computations underpin RSA key generation and modular arithmetic.']),

(6, 'Modular Multiplicative Inverse',
'Finding the number that "undoes" multiplication under a modulus — what multiplied by a gives 1 (mod m)? This is the foundation of decryption.',
'"You know that 3 × 5 mod 7 equals 1. So when you see 1 ÷ 3 mod 7, you know the answer is 5 — because 5 is the multiplicative inverse of 3 under mod 7."',
ARRAY['RSA decryption: given c^17 mod N, find d such that e×d ≡ 1 mod φ(N) — that d is the private key.','Error-correcting codes: finding inverse elements in Galois fields for data reconstruction.','Game theory: mixed strategies and Nash equilibrium calculations use modular inverses.']),

(7, 'Fast Large Powers (Binary Exponentiation)',
'To compute 2^1000, you do not multiply 2 by itself 999 times. You square, then square again — halving the problem each step. This is how computers compute powers instantly.',
'"A chess inventor asks for 1 grain of rice on the first square, 2 on the second, 4 on the third — doubling each time. The king laughs. But by square 64, he owes more rice than exists in the world. Computing powers efficiently was never more dramatically illustrated."',
ARRAY['Computing 2^30 mod N in encryption key generation: binary exponentiation reduces 29 multiplications to 7.','Compound interest calculations over 30 years done in milliseconds using exponentiation by squaring.','Graphics rendering: computing lighting and shading in 3D games uses fast power algorithms per pixel.']);

-- ── STAGES ──────────────────────────────────────────────────

-- Case Study 1: Fermat's Little Theorem — 7 stages
INSERT INTO stages (case_study_id, stage_number, concept_label) VALUES
(1, 1, 'Division basics'), (1, 2, 'Remainders'), (1, 3, 'Modulo operation'),
(1, 4, 'Modular multiplication patterns'), (1, 5, 'Powers under modulo'),
(1, 6, 'Cyclic behavior of powers'), (1, 7, 'The theorem revealed');

-- Case Study 2: Handshake Problem — 6 stages
INSERT INTO stages (case_study_id, stage_number, concept_label) VALUES
(2, 1, 'Simple counting'), (2, 2, 'Manual counting for 4 people'),
(2, 3, 'Repeated counting issue'), (2, 4, 'Pair formation'),
(2, 5, 'Combinations formula'), (2, 6, 'Generalized formula');

-- Case Study 3: Chinese Remainder Theorem — 6 stages
INSERT INTO stages (case_study_id, stage_number, concept_label) VALUES
(3, 1, 'Remainders'), (3, 2, 'Simultaneous conditions'), (3, 3, 'Coprime numbers'),
(3, 4, 'Modular equations'), (3, 5, 'Constructive solving'), (3, 6, 'Uniqueness');

-- Case Study 4: Coupon Collector Problem — 6 stages
INSERT INTO stages (case_study_id, stage_number, concept_label) VALUES
(4, 1, 'Probability basics'), (4, 2, 'Repeated outcomes'), (4, 3, 'Probability of unseen items'),
(4, 4, 'Expectation of one new coupon'), (4, 5, 'Expectation accumulation'), (4, 6, 'Harmonic growth');

-- Case Study 5: Euclidean Algorithm — 6 stages
INSERT INTO stages (case_study_id, stage_number, concept_label) VALUES
(5, 1, 'Subtraction toward common factor'), (5, 2, 'GCD via repeated subtraction'),
(5, 3, 'Division as shortcut'), (5, 4, 'Remainders in GCD'), (5, 5, 'Recursive reduction'), (5, 6, 'Algorithm derivation');

-- Case Study 6: Modular Multiplicative Inverse — 6 stages
INSERT INTO stages (case_study_id, stage_number, concept_label) VALUES
(6, 1, 'Multiplication under modulo'), (6, 2, 'Modular identity'), (6, 3, 'Coprime requirement'),
(6, 4, 'Setting up modular equations'), (6, 5, 'Extended Euclidean introduction'), (6, 6, 'Inverse derivation');

-- Case Study 7: Fast Large Powers (Binary Exponentiation) — 6 stages
INSERT INTO stages (case_study_id, stage_number, concept_label) VALUES
(7, 1, 'Repeated multiplication'), (7, 2, 'Squaring shortcut'),
(7, 3, 'Even vs odd exponent split'), (7, 4, 'Halving the problem'),
(7, 5, 'Binary representation'), (7, 6, 'Divide-and-conquer');

-- Get stage IDs for question insertion
\do $$
DECLARE
  s RECORD;
  q_num INT := 1;
BEGIN
  FOR s IN SELECT id, case_study_id, stage_number FROM stages ORDER BY case_study_id, stage_number LOOP
    RAISE NOTICE 'Stage % (CS %, S%) → ID: %', q_num, s.case_study_id, s.stage_number, s.id;
    q_num := q_num + 1;
  END LOOP;
END;
$$;