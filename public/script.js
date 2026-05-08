document.addEventListener("DOMContentLoaded", () => {
  const playerSelect = document.getElementById("player-select");
  const playerDetails = document.getElementById("player-details");

  // Periodically refresh the player list
  async function fetchPlayers() {
    try {
      const response = await fetch("/api/players");
      const playerIds = await response.json();

      // Keep current selection
      const currentSelection = playerSelect.value;
      playerSelect.innerHTML = '<option value="">Select an active player...</option>';

      playerIds.forEach((id) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = `Node: ${id}`;
        if (id === currentSelection) option.selected = true;
        playerSelect.appendChild(option);
      });
    } catch (err) {
      console.error("Failed to fetch players:", err);
    }
  }

  async function fetchPlayerDetails() {
    const id = playerSelect.value;
    if (!id) {
      playerDetails.innerHTML = "";
      return;
    }

    try {
      const response = await fetch(`/api/player/${id}`);
      const p = await response.json();

      playerDetails.innerHTML = `
                <div class="player-card">
                    <div class="stat-grid">
                        <div class="stat-item"><div class="stat-label">Location</div><div class="stat-value">${p.location}</div></div>
                        <div class="stat-item"><div class="stat-label">Health</div><div class="stat-value">${p.hp} / ${p.maxHp}</div></div>
                        <div class="stat-item"><div class="stat-label">Level</div><div class="stat-value">${p.level} (${p.xp} XP)</div></div>
                        <div class="stat-item"><div class="stat-label">Attack</div><div class="stat-value">${p.attack}</div></div>
                    </div>
                    <div style="margin-top: 24px;">
                        <h3 style="color: #38bdf8">Equipment</h3>
                        <p>Weapon: <strong>${p.weapon.name}</strong></p>
                        <p>Armor: <strong>${p.armor.name}</strong></p>
                    </div>
                    <div style="margin-top: 24px;">
                        <h3 style="color: #38bdf8">Inventory</h3>
                        <ul>${p.items.map((i) => `<li>${i.name} (${i.type || "Item"})</li>`).join("")}</ul>
                    </div>
                </div>
            `;
    } catch {
      playerDetails.innerHTML = `<p style="color: #ef4444">Error loading player data.</p>`;
    }
  }

  playerSelect.addEventListener("change", fetchPlayerDetails);
  setInterval(fetchPlayers, 5000);
  setInterval(fetchPlayerDetails, 3000); // Polling for live updates
  fetchPlayers();
});
