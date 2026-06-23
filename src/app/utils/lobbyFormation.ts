export const formationPositions: Record<string, string[]> = {
     "1-2-1": ["GK", "LB", "RB", "ST"],
     "2-1-1": ["GK", "CB", "CB2", "CM", "ST"],
     "2-2-0": ["GK", "CB", "CB2", "CM", "CM2"],
     "1-1-2": ["GK", "CB", "CM", "ST", "SS"],
     "3-2-1": ["GK", "LB", "CB", "RB", "CM", "CM2", "ST"],
     "2-3-1": ["GK", "CB", "CB2", "LM", "CM", "RM", "ST"],
     "2-2-2": ["GK", "CB", "CB2", "CM", "CM2", "ST", "SS"],
     "1-3-2": ["GK", "CB", "LM", "CM", "RM", "ST", "SS"],
     "3-1-2": ["GK", "LB", "CB", "RB", "CM", "ST", "SS"],
     "3-3-1": ["GK", "LB", "CB", "RB", "LM", "CM", "RM", "ST"],
     "2-4-1": ["GK", "CB", "CB2", "LM", "CM", "CM2", "RM", "ST"],
     "3-2-2": ["GK", "LB", "CB", "RB", "CM", "CM2", "ST", "SS"],
     "2-3-2": ["GK", "CB", "CB2", "LM", "CM", "RM", "ST", "SS"],
     "4-3-1": ["GK", "LB", "CB", "CB2", "RB", "LM", "CM", "RM", "ST"],
     "3-4-1": ["GK", "LB", "CB", "RB", "LM", "DM", "DM2", "RM", "ST"],
     "3-3-2": ["GK", "LB", "CB", "RB", "LM", "CM", "RM", "ST", "SS"],
     "2-4-2": ["GK", "CB", "CB2", "LM", "CM", "CM2", "RM", "ST", "SS"],
     "3-1-3-1": ["GK", "LB", "CB", "RB", "DM", "LM", "CM", "RM", "ST"],
     "3-2-3": ["GK", "LB", "CB", "RB", "CM", "CM2", "LW", "ST", "RW"],
     "3-3-3": ["GK", "LB", "CB", "RB", "LM", "CM", "RM", "LW", "ST", "RW"],
     "3-4-2": ["GK", "LB", "CB", "RB", "LM", "CM", "CM2", "RM", "ST", "SS"],
     "4-3-2": ["GK", "LB", "CB", "CB2", "RB", "LM", "CM", "RM", "ST", "SS"],
     "3-5-2": ["GK", "LB", "CB", "RB", "LM", "DM", "CM", "DM2", "RM", "ST", "SS"],
     "5-3-2": ["GK", "LB", "CB", "CB2", "CB3", "RB", "LM", "CM", "RM", "ST", "SS"],
     "4-4-2": ["GK", "LB", "CB", "CB2", "RB", "LM", "CM", "CM2", "RM", "ST", "SS"],
     "4-3-3": ["GK", "LB", "CB", "CB2", "RB", "CM", "CM2", "CM3", "LW", "ST", "RW"],
     "3-4-3": ["GK", "LB", "CB", "RB", "LM", "CM", "CM2", "RM", "LW", "ST", "RW"],
     "5-4-1": ["GK", "LB", "CB", "CB2", "CB3", "RB", "LM", "CM", "CM2", "RM", "ST"],
};

const slotPositionNames: Record<string, string> = {
     GK: "Goalkeeper",
     CB: "Center Back",
     CB2: "Center Back",
     CB3: "Center Back",
     LB: "Left Back",
     RB: "Right Back",
     SW: "Sweeper",
     WB: "Wing Back",
     WB2: "Wing Back",
     DM: "Defensive Midfielder",
     DM2: "Defensive Midfielder",
     CM: "Central Midfielder",
     CM2: "Central Midfielder",
     CM3: "Central Midfielder",
     AM: "Attacking Midfielder",
     LM: "Left Midfielder",
     RM: "Right Midfielder",
     ST: "Striker",
     SS: "Second Striker",
     CF: "Center Forward",
     CF2: "Center Forward",
     LW: "Left Winger",
     RW: "Right Winger",
};

const positionAliases: Record<string, string> = {
     goalkeeper: "Goalkeeper",
     gk: "Goalkeeper",
     "center back": "Center Back",
     "centre back": "Center Back",
     "second center back": "Center Back",
     "second centre back": "Center Back",
     cb: "Center Back",
     cb2: "Center Back",
     cb3: "Center Back",
     "left back": "Left Back",
     lb: "Left Back",
     "right back": "Right Back",
     rb: "Right Back",
     sweeper: "Sweeper",
     sw: "Sweeper",
     "wing back": "Wing Back",
     "second wing back": "Wing Back",
     wb: "Wing Back",
     wb2: "Wing Back",
     "defensive midfielder": "Defensive Midfielder",
     "second defensive midfielder": "Defensive Midfielder",
     dm: "Defensive Midfielder",
     dm2: "Defensive Midfielder",
     "central midfielder": "Central Midfielder",
     "center midfielder": "Central Midfielder",
     "second central midfielder": "Central Midfielder",
     cm: "Central Midfielder",
     cm2: "Central Midfielder",
     cm3: "Central Midfielder",
     "attacking midfielder": "Attacking Midfielder",
     am: "Attacking Midfielder",
     "left midfielder": "Left Midfielder",
     lm: "Left Midfielder",
     "right midfielder": "Right Midfielder",
     rm: "Right Midfielder",
     striker: "Striker",
     st: "Striker",
     "second striker": "Second Striker",
     ss: "Second Striker",
     "center forward": "Center Forward",
     "centre forward": "Center Forward",
     "second center forward": "Center Forward",
     "second centre forward": "Center Forward",
     cf: "Center Forward",
     cf2: "Center Forward",
     "left winger": "Left Winger",
     lw: "Left Winger",
     "right winger": "Right Winger",
     rw: "Right Winger",
};

export const isKnownFormation = (formation: unknown) => {
     return Object.prototype.hasOwnProperty.call(
          formationPositions,
          formation?.toString() || ""
     );
};

export const normalizeMatchPosition = (position: unknown) => {
     const raw = position?.toString().trim() || "";
     if (!raw) return "";

     const upper = raw.toUpperCase();
     if (slotPositionNames[upper]) return slotPositionNames[upper];

     return positionAliases[raw.toLowerCase()] || raw;
};

export const getFormationPositionNames = (formation: unknown) => {
     const slots = formationPositions[formation?.toString() || ""] || [];
     return slots.map((slot) => normalizeMatchPosition(slot));
};

export const getAllowedPositionCount = (formation: unknown, position: unknown) => {
     const requestedPosition = normalizeMatchPosition(position);
     if (!requestedPosition) return 0;

     const count = getFormationPositionNames(formation).filter(
          (slotPosition) => slotPosition === requestedPosition
     ).length;

     return count > 0 ? count : 1;
};

export const countPlayersInPosition = (players: any[] = [], position: unknown) => {
     const requestedPosition = normalizeMatchPosition(position);
     return players.filter(
          (player) => normalizeMatchPosition(player?.matchPosition) === requestedPosition
     ).length;
};

export const hasPositionCapacity = (
     players: any[] = [],
     formation: unknown,
     position: unknown,
     extraCount = 0
) => {
     const allowedCount = getAllowedPositionCount(formation, position);
     return countPlayersInPosition(players, position) + extraCount < allowedCount;
};

export const remapPlayersToFormation = (players: any[] = [], formation: unknown) => {
     const formationPositions = getFormationPositionNames(formation);
     if (formationPositions.length === 0) return players;

     const slots = formationPositions.map((position, index) => ({
          index,
          position,
          used: false,
     }));

     const assignPlayer = (player: any, position: string) => {
          player.matchPosition = position;
     };

     const findOpenSlot = (position?: string, allowGoalkeeper = true) => {
          return slots.find((slot) => {
               if (slot.used) return false;
               if (!allowGoalkeeper && slot.position === "Goalkeeper") return false;
               return position ? slot.position === position : true;
          });
     };

     const remainingPlayers: any[] = [];

     for (const player of players) {
          const normalizedPosition = normalizeMatchPosition(player?.matchPosition);

          if (normalizedPosition === "Goalkeeper") {
               const slot = findOpenSlot("Goalkeeper");
               if (slot) slot.used = true;
               assignPlayer(player, "Goalkeeper");
               continue;
          }

          const slot = findOpenSlot(normalizedPosition, false);
          if (slot) {
               slot.used = true;
               assignPlayer(player, slot.position);
          } else {
               remainingPlayers.push(player);
          }
     }

     for (const player of remainingPlayers) {
          const slot = findOpenSlot(undefined, false);
          if (slot) {
               slot.used = true;
               assignPlayer(player, slot.position);
          } else {
               assignPlayer(player, normalizeMatchPosition(player?.matchPosition));
          }
     }

     return players;
};

export const calculateAverageMainRating = (players: any[] = []) => {
     if (!players.length) return 0;
     const sum = players.reduce(
          (total, player) => total + (player.mainRating || player.rating || 0),
          0
     );
     return sum / players.length;
};
