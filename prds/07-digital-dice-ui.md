# PRD 07: Digital Dice UI

> **Status**: Ready for Implementation  
> **Priority**: P1 - High  
> **Estimated Effort**: 3 days  
> **Dependencies**: 01-dice-system

---

## Overview

The Digital Dice UI provides satisfying visual and audio feedback for all dice rolls in SPARC RPG. It transforms mechanical dice resolution into an exciting moment that builds tension and delivers dramatic reveals. The component must work flawlessly across all devices while maintaining the tactile joy of physical dice.

### Goals
- Create satisfying, exciting dice roll animations
- Provide clear success/failure feedback
- Support all roll types (attribute checks, combat, etc.)
- Work smoothly on mobile and desktop
- Sync animations across all players in real-time

### Non-Goals
- Custom dice skins/themes (future feature)
- 3D physics-based rolling (performance concern)
- Physical dice camera integration
- Sound customization

---

## User Stories

### US-01: See Dice Animation
**As a** player  
**I want to** see an animated dice roll  
**So that** rolling feels exciting and impactful

**Acceptance Criteria:**
- [ ] Dice visually tumble/roll for 1-2 seconds
- [ ] Each die shows its final value clearly
- [ ] Animation is smooth at 60fps
- [ ] Works on mobile and desktop
- [ ] Can be skipped for impatient users

### US-02: Understand Roll Result
**As a** player  
**I want to** clearly see if I succeeded or failed  
**So that** I understand the outcome immediately

**Acceptance Criteria:**
- [ ] Success shown with green highlight/celebration
- [ ] Failure shown with red highlight
- [ ] Critical success has special celebration
- [ ] Critical failure has distinct visual
- [ ] Total vs difficulty clearly displayed

### US-03: See Others' Rolls
**As a** player  
**I want to** see other players' dice rolls  
**So that** I can share in the excitement

**Acceptance Criteria:**
- [ ] Other players' rolls appear in real-time
- [ ] Show who rolled and why
- [ ] Animation plays for all viewers
- [ ] Can distinguish my rolls from others
- [ ] Roll history accessible

### US-04: Trigger My Roll
**As a** player on my turn  
**I want to** click/tap to roll  
**So that** I feel agency over the moment

**Acceptance Criteria:**
- [ ] Clear "Roll" button when roll is needed
- [ ] Satisfying click/tap feedback
- [ ] Optional shake-to-roll on mobile
- [ ] Countdown or confirmation before rolling
- [ ] Cannot double-roll accidentally

### US-05: See Modifiers
**As a** player  
**I want to** see what modifiers affect my roll  
**So that** I understand my chances

**Acceptance Criteria:**
- [ ] Modifier sources listed before roll
- [ ] Dice count clearly shown
- [ ] Difficulty number displayed
- [ ] Flat bonuses visible
- [ ] Math breakdown available

### US-06: Audio Feedback
**As a** player  
**I want to** hear dice sounds  
**So that** rolling feels more satisfying

**Acceptance Criteria:**
- [ ] Dice tumbling sound during animation
- [ ] Click/clack of dice settling
- [ ] Success fanfare on success
- [ ] Tension sound on critical moments
- [ ] Sound can be muted

---

## Technical Specification

### Component Architecture

```
DiceRollOverlay
├── RollHeader
│   ├── CharacterName
│   ├── RollType
│   └── DifficultyBadge
├── DiceContainer
│   ├── Die (×N based on dice count)
│   │   ├── DiceFace
│   │   └── DiceAnimation
│   └── ModifierDisplay
├── ResultDisplay
│   ├── TotalValue
│   ├── VsDifficulty
│   └── OutcomeBadge (Success/Failure)
├── RollControls
│   ├── RollButton
│   ├── HeroicSaveButton
│   └── SkipButton
└── AudioController
```

### TypeScript Interfaces

```typescript
interface DiceRollOverlayProps {
  roll: DiceRoll | DiceRollRequest;
  isRolling: boolean;
  onRoll?: () => void;
  onHeroicSave?: () => void;
  onDismiss: () => void;
  showHeroicSave: boolean;
  isMyRoll: boolean;
}

interface DieProps {
  value: number;              // 1-6, final value
  index: number;              // For staggered animation
  isRolling: boolean;
  animationSeed: number;      // For deterministic animation
}

interface DiceAnimationConfig {
  duration: number;           // Total animation time (ms)
  settleDuration: number;     // Time for dice to settle
  staggerDelay: number;       // Delay between dice
  bounceCount: number;        // Number of value changes
}

const DEFAULT_ANIMATION_CONFIG: DiceAnimationConfig = {
  duration: 1500,
  settleDuration: 500,
  staggerDelay: 100,
  bounceCount: 8,
};
```

### Dice Animation System

```typescript
// Deterministic animation based on seed
function generateRollSequence(
  finalValue: number,
  seed: number,
  config: DiceAnimationConfig
): number[] {
  const rng = createSeededRandom(seed);
  const sequence: number[] = [];
  
  // Generate intermediate values
  for (let i = 0; i < config.bounceCount; i++) {
    sequence.push(Math.floor(rng() * 6) + 1);
  }
  
  // Always end with final value
  sequence.push(finalValue);
  
  return sequence;
}

// CSS-based animation with transforms
const diceKeyframes = keyframes`
  0% {
    transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
  }
  25% {
    transform: rotateX(180deg) rotateY(90deg) rotateZ(45deg);
  }
  50% {
    transform: rotateX(360deg) rotateY(180deg) rotateZ(90deg);
  }
  75% {
    transform: rotateX(540deg) rotateY(270deg) rotateZ(135deg);
  }
  100% {
    transform: rotateX(720deg) rotateY(360deg) rotateZ(180deg);
  }
`;

// Die component with animation
function Die({ value, index, isRolling, animationSeed }: DieProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const sequence = useMemo(
    () => generateRollSequence(value, animationSeed + index, DEFAULT_ANIMATION_CONFIG),
    [value, animationSeed, index]
  );
  
  useEffect(() => {
    if (!isRolling) {
      setDisplayValue(value);
      return;
    }
    
    let frame = 0;
    const interval = setInterval(() => {
      if (frame < sequence.length) {
        setDisplayValue(sequence[frame]);
        frame++;
      } else {
        clearInterval(interval);
      }
    }, DEFAULT_ANIMATION_CONFIG.duration / sequence.length);
    
    return () => clearInterval(interval);
  }, [isRolling, sequence, value]);
  
  return (
    <motion.div
      className={cn('die', `die-${displayValue}`)}
      initial={{ scale: 0, rotate: 0 }}
      animate={{
        scale: isRolling ? [1, 1.2, 1] : 1,
        rotate: isRolling ? [0, 360, 720] : 0,
      }}
      transition={{
        duration: DEFAULT_ANIMATION_CONFIG.duration / 1000,
        delay: index * (DEFAULT_ANIMATION_CONFIG.staggerDelay / 1000),
        ease: 'easeOut',
      }}
    >
      <DiceFace value={displayValue} />
    </motion.div>
  );
}
```

### Dice Face Rendering

```typescript
// SVG-based dice faces for crisp rendering at any size
function DiceFace({ value }: { value: number }) {
  const dots = DICE_DOTS[value];
  
  return (
    <svg viewBox="0 0 100 100" className="dice-face">
      {/* Background */}
      <rect 
        x="5" y="5" 
        width="90" height="90" 
        rx="15" 
        fill="white" 
        stroke="#333" 
        strokeWidth="2"
      />
      
      {/* Dots */}
      {dots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.x}
          cy={dot.y}
          r="10"
          fill="#333"
        />
      ))}
    </svg>
  );
}

const DICE_DOTS: Record<number, Array<{ x: number; y: number }>> = {
  1: [{ x: 50, y: 50 }],
  2: [{ x: 25, y: 25 }, { x: 75, y: 75 }],
  3: [{ x: 25, y: 25 }, { x: 50, y: 50 }, { x: 75, y: 75 }],
  4: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
  5: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 50, y: 50 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
  6: [{ x: 25, y: 25 }, { x: 25, y: 50 }, { x: 25, y: 75 }, { x: 75, y: 25 }, { x: 75, y: 50 }, { x: 75, y: 75 }],
};
```

### Result Display

```typescript
function ResultDisplay({ roll }: { roll: DiceRoll }) {
  const outcomeConfig = OUTCOME_CONFIGS[roll.outcome];
  
  return (
    <motion.div 
      className="result-display"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: DEFAULT_ANIMATION_CONFIG.duration / 1000 + 0.2 }}
    >
      {/* Total */}
      <div className="total">
        <span className="total-value">{roll.modifiedTotal}</span>
        {roll.modifiedTotal !== roll.total && (
          <span className="base-total">({roll.total} + {roll.modifiedTotal - roll.total})</span>
        )}
      </div>
      
      {/* vs Difficulty */}
      <div className="comparison">
        <span>vs</span>
        <span className="difficulty">{roll.difficulty}</span>
      </div>
      
      {/* Outcome */}
      <motion.div 
        className={cn('outcome', outcomeConfig.className)}
        animate={outcomeConfig.animation}
      >
        {outcomeConfig.icon}
        <span>{outcomeConfig.label}</span>
      </motion.div>
      
      {/* Margin */}
      <div className="margin">
        {roll.success 
          ? `Won by ${roll.margin}` 
          : `Missed by ${Math.abs(roll.margin)}`
        }
      </div>
    </motion.div>
  );
}

const OUTCOME_CONFIGS = {
  [RollOutcome.CRITICAL_SUCCESS]: {
    className: 'critical-success',
    label: 'CRITICAL SUCCESS!',
    icon: <StarIcon />,
    animation: {
      scale: [1, 1.2, 1],
      rotate: [0, 5, -5, 0],
    },
  },
  [RollOutcome.SUCCESS]: {
    className: 'success',
    label: 'Success!',
    icon: <CheckIcon />,
    animation: {},
  },
  [RollOutcome.FAILURE]: {
    className: 'failure',
    label: 'Failure',
    icon: <XIcon />,
    animation: {},
  },
  [RollOutcome.CRITICAL_FAILURE]: {
    className: 'critical-failure',
    label: 'CRITICAL FAILURE',
    icon: <SkullIcon />,
    animation: {
      x: [0, -5, 5, -5, 5, 0],
    },
  },
};
```

### Audio System

```typescript
interface DiceAudioConfig {
  rollSound: string;
  settleSound: string;
  successSound: string;
  failureSound: string;
  criticalSuccessSound: string;
  criticalFailureSound: string;
}

const AUDIO_CONFIG: DiceAudioConfig = {
  rollSound: '/audio/dice-roll.mp3',
  settleSound: '/audio/dice-settle.mp3',
  successSound: '/audio/success-chime.mp3',
  failureSound: '/audio/failure-thud.mp3',
  criticalSuccessSound: '/audio/critical-success-fanfare.mp3',
  criticalFailureSound: '/audio/critical-failure-thunder.mp3',
};

function useDiceAudio() {
  const { soundEnabled, sfxVolume } = useUserPreferences();
  const audioContext = useRef<AudioContext | null>(null);
  const audioCache = useRef<Map<string, AudioBuffer>>(new Map());
  
  useEffect(() => {
    if (soundEnabled) {
      audioContext.current = new AudioContext();
      // Preload sounds
      Object.values(AUDIO_CONFIG).forEach(url => preloadSound(url));
    }
    return () => audioContext.current?.close();
  }, [soundEnabled]);
  
  const playSound = useCallback((type: keyof DiceAudioConfig) => {
    if (!soundEnabled || !audioContext.current) return;
    
    const buffer = audioCache.current.get(AUDIO_CONFIG[type]);
    if (!buffer) return;
    
    const source = audioContext.current.createBufferSource();
    const gainNode = audioContext.current.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = sfxVolume / 100;
    
    source.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    source.start();
  }, [soundEnabled, sfxVolume]);
  
  return { playSound };
}
```

### Mobile Shake-to-Roll

```typescript
function useShakeToRoll(onRoll: () => void, enabled: boolean) {
  const lastShake = useRef<number>(0);
  const shakeThreshold = 15; // m/s²
  const shakeCooldown = 2000; // ms
  
  useEffect(() => {
    if (!enabled || typeof DeviceMotionEvent === 'undefined') return;
    
    const handleMotion = (event: DeviceMotionEvent) => {
      const { x, y, z } = event.accelerationIncludingGravity || {};
      if (x === null || y === null || z === null) return;
      
      const acceleration = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();
      
      if (acceleration > shakeThreshold && now - lastShake.current > shakeCooldown) {
        lastShake.current = now;
        onRoll();
      }
    };
    
    // Request permission on iOS 13+
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          }
        });
    } else {
      window.addEventListener('devicemotion', handleMotion);
    }
    
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [enabled, onRoll]);
}
```

### Real-Time Sync

```typescript
// Ensure all players see synchronized animation
function useSyncedDiceAnimation(sessionId: string) {
  const [currentRoll, setCurrentRoll] = useState<DiceRoll | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    const channel = supabase
      .channel(`dice:${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'dice_rolls', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const roll = payload.new as DiceRoll;
          setCurrentRoll(roll);
          setIsAnimating(true);
          
          // Animation duration + settle time
          setTimeout(() => {
            setIsAnimating(false);
          }, DEFAULT_ANIMATION_CONFIG.duration + DEFAULT_ANIMATION_CONFIG.settleDuration);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);
  
  return { currentRoll, isAnimating };
}
```

### Styling

```css
/* Dice container layout */
.dice-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  max-width: 400px;
  margin: 0 auto;
}

/* Individual die */
.die {
  width: 60px;
  height: 60px;
  perspective: 600px;
}

@media (min-width: 768px) {
  .die {
    width: 80px;
    height: 80px;
  }
}

/* Die face styling */
.dice-face {
  width: 100%;
  height: 100%;
  filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.3));
}

/* Outcome colors */
.outcome.success {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.outcome.failure {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.outcome.critical-success {
  color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(234, 179, 8, 0.2));
  animation: glow 1s ease-in-out infinite alternate;
}

.outcome.critical-failure {
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.1);
}

@keyframes glow {
  from {
    box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
  }
  to {
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.8);
  }
}
```

---

## Testing Requirements

### Unit Tests

```typescript
describe('Die', () => {
  it('should display final value after animation', async () => {
    render(<Die value={6} index={0} isRolling={true} animationSeed={12345} />);
    
    // Wait for animation to complete
    await waitFor(() => {
      expect(screen.getByTestId('dice-face')).toHaveClass('die-6');
    }, { timeout: 2000 });
  });

  it('should apply stagger delay based on index', () => {
    const { rerender } = render(
      <Die value={1} index={0} isRolling={true} animationSeed={1} />
    );
    
    const die0 = screen.getByTestId('die');
    expect(die0).toHaveStyle({ animationDelay: '0ms' });
    
    rerender(<Die value={1} index={2} isRolling={true} animationSeed={1} />);
    expect(screen.getByTestId('die')).toHaveStyle({ animationDelay: '200ms' });
  });
});

describe('generateRollSequence', () => {
  it('should always end with final value', () => {
    for (let finalValue = 1; finalValue <= 6; finalValue++) {
      const sequence = generateRollSequence(finalValue, Math.random(), DEFAULT_ANIMATION_CONFIG);
      expect(sequence[sequence.length - 1]).toBe(finalValue);
    }
  });

  it('should be deterministic for same seed', () => {
    const seed = 42;
    const seq1 = generateRollSequence(4, seed, DEFAULT_ANIMATION_CONFIG);
    const seq2 = generateRollSequence(4, seed, DEFAULT_ANIMATION_CONFIG);
    expect(seq1).toEqual(seq2);
  });
});

describe('ResultDisplay', () => {
  it('should show success styling for successful roll', () => {
    const roll = createRoll({ success: true, outcome: RollOutcome.SUCCESS });
    render(<ResultDisplay roll={roll} />);
    
    expect(screen.getByTestId('outcome')).toHaveClass('success');
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('should show critical success with special styling', () => {
    const roll = createRoll({ outcome: RollOutcome.CRITICAL_SUCCESS });
    render(<ResultDisplay roll={roll} />);
    
    expect(screen.getByTestId('outcome')).toHaveClass('critical-success');
    expect(screen.getByText('CRITICAL SUCCESS!')).toBeInTheDocument();
  });

  it('should display modifier breakdown', () => {
    const roll = createRoll({ total: 10, modifiedTotal: 13 });
    render(<ResultDisplay roll={roll} />);
    
    expect(screen.getByText('13')).toBeInTheDocument();
    expect(screen.getByText('(10 + 3)')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
describe('DiceRollOverlay Integration', () => {
  it('should complete full roll animation flow', async () => {
    const onRoll = jest.fn();
    const roll = createPendingRoll({ diceCount: 3, difficulty: 12 });
    
    const { rerender } = render(
      <DiceRollOverlay
        roll={roll}
        isRolling={false}
        onRoll={onRoll}
        onDismiss={jest.fn()}
        showHeroicSave={false}
        isMyRoll={true}
      />
    );
    
    // Click roll button
    await userEvent.click(screen.getByRole('button', { name: /roll/i }));
    expect(onRoll).toHaveBeenCalled();
    
    // Simulate roll completing
    const completedRoll = createCompletedRoll({ ...roll, results: [4, 5, 6] });
    rerender(
      <DiceRollOverlay
        roll={completedRoll}
        isRolling={true}
        onRoll={onRoll}
        onDismiss={jest.fn()}
        showHeroicSave={false}
        isMyRoll={true}
      />
    );
    
    // Wait for animation to complete
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('Success!')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should play audio on roll', async () => {
    const playSound = jest.fn();
    jest.spyOn(useDiceAudio, 'mockReturnValue').mockReturnValue({ playSound });
    
    render(<DiceRollOverlay roll={createRoll()} isRolling={true} {...defaultProps} />);
    
    expect(playSound).toHaveBeenCalledWith('rollSound');
    
    // Wait for result
    await waitFor(() => {
      expect(playSound).toHaveBeenCalledWith('successSound');
    });
  });
});
```

### E2E Tests

```typescript
describe('Dice UI E2E', () => {
  it('should roll dice with full animation', async () => {
    await loginAsPlayer(page);
    await joinSession(page, sessionCode);
    
    // Trigger a roll
    await page.click('[data-testid="roll-button"]');
    
    // Dice should appear and animate
    await page.waitForSelector('[data-testid="dice-overlay"]');
    const dice = await page.$$('[data-testid="die"]');
    expect(dice.length).toBeGreaterThan(0);
    
    // Wait for result
    await page.waitForSelector('[data-testid="roll-result"]', { timeout: 3000 });
    
    // Verify result is displayed
    const total = await page.textContent('[data-testid="total-value"]');
    expect(parseInt(total)).toBeGreaterThan(0);
  });

  it('should sync animation across players', async () => {
    // Player 1 rolls
    await player1Page.click('[data-testid="roll-button"]');
    
    // Player 2 should see the animation
    await player2Page.waitForSelector('[data-testid="dice-overlay"]');
    
    // Both should see same final result
    await Promise.all([
      player1Page.waitForSelector('[data-testid="roll-result"]'),
      player2Page.waitForSelector('[data-testid="roll-result"]'),
    ]);
    
    const result1 = await player1Page.textContent('[data-testid="total-value"]');
    const result2 = await player2Page.textContent('[data-testid="total-value"]');
    expect(result1).toBe(result2);
  });
});
```

---

## Implementation Checklist

### Components
- [ ] Create `DiceRollOverlay` container
- [ ] Create `Die` component with animation
- [ ] Create `DiceFace` SVG component
- [ ] Create `ResultDisplay` component
- [ ] Create `RollControls` component
- [ ] Create `ModifierDisplay` component
- [ ] Create `RollHistory` panel

### Animation
- [ ] Implement deterministic animation sequence
- [ ] Add CSS keyframe animations
- [ ] Add Framer Motion integration
- [ ] Add stagger delays
- [ ] Add result reveal animation
- [ ] Add critical animations

### Audio
- [ ] Implement `useDiceAudio` hook
- [ ] Create/source audio files
- [ ] Add audio preloading
- [ ] Add volume control
- [ ] Add mute support

### Mobile
- [ ] Implement shake-to-roll
- [ ] Request device motion permissions
- [ ] Test touch interactions
- [ ] Optimize for small screens

### Real-Time
- [ ] Implement Supabase subscription
- [ ] Sync animation seed
- [ ] Handle late-joining viewers
- [ ] Add connection recovery

---

## Appendix

### Animation Timing

| Phase | Duration | Description |
|-------|----------|-------------|
| Roll start | 0ms | Dice appear, roll sound starts |
| Tumbling | 0-1200ms | Dice animate with random faces |
| Settling | 1200-1500ms | Dice slow down to final value |
| Result reveal | 1500-1800ms | Total and outcome appear |
| Ready to dismiss | 1800ms+ | User can close or use heroic save |

### Accessibility

- Dice faces use high contrast
- Results announced via aria-live
- Animation can be reduced (prefers-reduced-motion)
- Keyboard accessible roll trigger
- Color-blind friendly success/failure indicators
