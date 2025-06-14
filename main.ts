import { Plugin, WorkspaceLeaf, ItemView, TFile } from 'obsidian';

const VIEW_TYPE_LEMONADE = "lemonade-stand-view";

interface GameState {
	day: number;
	players: Player[];
	currentPlayer: number;
	weather: number;
	gamePhase: 'intro' | 'setup' | 'daily' | 'results' | 'events' | 'gameover';
	weatherEvents: {
		streetWork: boolean;
		thunderstorm: boolean;
		heatWave: boolean;
		lightRain: boolean;
	};
}

interface Player {
	id: number;
	assets: number;
	glasses: number;
	signs: number;
	price: number;
	bankrupt: boolean;
	glassesSold: number;
	income: number;
	expenses: number;
	profit: number;
}

class LemonadeStandView extends ItemView {
	private gameState: GameState;
	private terminal: HTMLElement;
	private inputField: HTMLInputElement;
	private currentPrompt: string = '';
	private waitingForInput: boolean = false;
	private inputCallback: ((input: string) => void) | null = null;
	private cursorInterval: any;

	getViewType(): string {
		return VIEW_TYPE_LEMONADE;
	}

	getDisplayText(): string {
		return "Lemonade Stand";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		
		// Create retro terminal container
		const terminalContainer = container.createEl("div", {
			cls: "lemonade-terminal-container"
		});
		
		// Create terminal screen with bezel effect
		this.terminal = terminalContainer.createEl("div", {
			cls: "lemonade-terminal"
		});
		
		// Create input area
		const inputContainer = terminalContainer.createEl("div", {
			cls: "lemonade-input-container"
		});
		
		const promptSpan = inputContainer.createEl("span", {
			cls: "lemonade-prompt",
			text: ""
		});
		
		this.inputField = inputContainer.createEl("input", {
			cls: "lemonade-input",
			type: "text"
		});
		
		// Add blinking cursor
		const cursor = inputContainer.createEl("span", {
			cls: "lemonade-cursor",
			text: "█"
		});
		
		this.cursorInterval = setInterval(() => {
			cursor.style.visibility = cursor.style.visibility === 'hidden' ? 'visible' : 'hidden';
		}, 530);
		
		this.inputField.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' && this.waitingForInput) {
				this.handleInput(this.inputField.value);
				this.inputField.value = '';
			}
		});
		
		// Add retro styles
		this.addRetroStyles();
		
		// Initialize and start game with intro
		this.initializeGame();
		await this.showIntroSequence();
		await this.startGame();
	}

	private addRetroStyles() {
		const style = document.createElement('style');
		style.textContent = `
			.lemonade-terminal-container {
				background: #2a2a2a;
				border: 20px solid #1a1a1a;
				border-radius: 15px;
				box-shadow: 
					inset 0 0 50px rgba(0,0,0,0.8),
					0 0 30px rgba(0,255,0,0.3);
				height: calc(100vh - 100px);
				overflow: hidden;
				position: relative;
			}
			
			.lemonade-terminal-container::before {
				content: '';
				position: absolute;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: 
					repeating-linear-gradient(
						0deg,
						transparent,
						transparent 2px,
						rgba(0,255,0,0.03) 2px,
						rgba(0,255,0,0.03) 4px
					);
				pointer-events: none;
				z-index: 1000;
			}
			
			.lemonade-terminal {
				background-color: #000;
				color: #00ff41;
				font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
				font-size: 14px;
				font-weight: bold;
				padding: 30px;
				height: calc(100% - 60px);
				overflow-y: auto;
				white-space: pre-wrap;
				line-height: 1.2;
				letter-spacing: 1px;
				text-shadow: 0 0 10px #00ff41;
			}
			
			.lemonade-input-container {
				background-color: #000;
				color: #00ff41;
				font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
				font-size: 14px;
				font-weight: bold;
				padding: 0 30px 30px 30px;
				display: flex;
				align-items: center;
				letter-spacing: 1px;
				text-shadow: 0 0 10px #00ff41;
			}
			
			.lemonade-prompt {
				color: #00ff41;
			}
			
			.lemonade-input {
				background-color: transparent;
				border: none;
				color: #00ff41;
				font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
				font-size: 14px;
				font-weight: bold;
				outline: none;
				flex: 1;
				margin-left: 5px;
				letter-spacing: 1px;
				text-shadow: 0 0 10px #00ff41;
			}
			
			.lemonade-cursor {
				color: #00ff41;
				margin-left: 2px;
				text-shadow: 0 0 10px #00ff41;
				animation: blink 1.06s infinite;
			}
			
			@keyframes blink {
				0%, 50% { opacity: 1; }
				51%, 100% { opacity: 0; }
			}
			
			.lemonade-terminal::-webkit-scrollbar {
				width: 12px;
			}
			
			.lemonade-terminal::-webkit-scrollbar-track {
				background: #1a1a1a;
			}
			
			.lemonade-terminal::-webkit-scrollbar-thumb {
				background: #00ff41;
				border-radius: 6px;
			}
			
			.lemonade-terminal::-webkit-scrollbar-thumb:hover {
				background: #00cc33;
			}
		`;
		document.head.appendChild(style);
	}

	private initializeGame() {
		this.gameState = {
			day: 0,
			players: [],
			currentPlayer: 0,
			weather: 2,
			gamePhase: 'intro',
			weatherEvents: {
				streetWork: false,
				thunderstorm: false,
				heatWave: false,
				lightRain: false
			}
		};
	}

	private async showIntroSequence() {
		// Clear screen
		this.terminal.textContent = '';
		
		// Show loading sequence
		await this.typeText("APPLE ][ COMPUTER", 50);
		await this.delay(800);
		await this.typeText("\n\nBOOTING LEMONADE STAND v1.0", 50);
		await this.delay(500);
		await this.typeText("\n\nLOADING", 100);
		for (let i = 0; i < 10; i++) {
			await this.delay(200);
			this.terminal.textContent += ".";
		}
		await this.delay(1000);
		
		// Clear and show title screen
		this.terminal.textContent = '';
		await this.delay(500);
		
		// ASCII title art
		const titleArt = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ╦    ╔═╗ ╔╦╗  ╔═╗ ╔╗╔  ╔═╗ ╔╦╗  ╔═╗    ╔═╗ ╔╦╗  ╔═╗ ╔╗╔  ╔╦╗              ║
║   ║    ║╣  ║║║  ║ ║ ║║║  ╠═╣  ║║  ║╣     ╚═╗  ║   ╠═╣ ║║║   ║║              ║
║   ╩═╝  ╚═╝ ╩ ╩  ╚═╝ ╝╚╝  ╩ ╩ ╩╝   ╚═╝    ╚═╝  ╩   ╩ ╩ ╝╚╝  ╩╝               ║
║                                                                              ║
║                           * BUSINESS SIMULATION *                            ║
║                                                                              ║
║    FROM AN ORIGINAL PROGRAM BY BOB JAMISON, OF THE                          ║
║      MINNESOTA EDUCATIONAL COMPUTING CONSORTIUM                             ║
║                        * * *                                                ║
║      MODIFIED FOR THE APPLE FEBRUARY, 1979                                  ║
║         BY CHARLIE KELLNER                                                  ║
║                                                                              ║
║                     COPYRIGHT 1979 APPLE COMPUTER INC.                      ║
╚══════════════════════════════════════════════════════════════════════════════╝`;

		await this.typeText(titleArt, 10);
		await this.delay(3000);
		
		// Lemonade stand ASCII art
		this.terminal.textContent = '';
		const standArt = `
                               ╔═══════════════════╗
                              ║   LEMONADE  25¢   ║
                              ╚═════════════════▼═╝
                                    ╔═══════════╗
                             ╔══════╣           ║
                             ║      ║  🍋 🍋 🍋  ║
                             ║      ║           ║
                             ║      ║  [GLASS]  ║
                             ║      ║           ║
                             ╚══════╣           ║
                                    ╚═══════════╝
                                         ║║║
                                      ═══╬╬╬═══
`;

		await this.typeText(standArt, 20);
		await this.delay(2000);
	}

	private async typeText(text: string, speed: number = 50) {
		for (const char of text) {
			this.terminal.textContent += char;
			this.terminal.scrollTop = this.terminal.scrollHeight;
			await this.delay(speed);
		}
	}

	private delay(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	private print(text: string) {
		this.terminal.appendChild(document.createTextNode(text + '\n'));
		this.terminal.scrollTop = this.terminal.scrollHeight;
	}

	private async waitForInput(prompt: string = ''): Promise<string> {
		return new Promise((resolve) => {
			this.currentPrompt = prompt;
			if (prompt) {
				this.print(prompt);
			}
			this.waitingForInput = true;
			this.inputCallback = resolve;
			this.inputField.focus();
		});
	}

	private handleInput(input: string) {
		this.print('> ' + input);
		this.waitingForInput = false;
		if (this.inputCallback) {
			this.inputCallback(input);
			this.inputCallback = null;
		}
	}

	private async startGame() {
		this.terminal.textContent = '';
		
		await this.typeText("HI! WELCOME TO LEMONSVILLE, CALIFORNIA!\n\n", 30);
		await this.typeText("IN THIS SMALL TOWN, YOU ARE IN CHARGE OF\n", 30);
		await this.typeText("RUNNING YOUR OWN LEMONADE STAND. YOU CAN\n", 30);
		await this.typeText("COMPETE WITH AS MANY OTHER PEOPLE AS YOU\n", 30);
		await this.typeText("WISH, BUT HOW MUCH PROFIT YOU MAKE IS UP\n", 30);
		await this.typeText("TO YOU (THE OTHER STANDS' SALES WILL NOT\n", 30);
		await this.typeText("AFFECT YOUR BUSINESS IN ANY WAY). IF YOU\n", 30);
		await this.typeText("MAKE THE MOST MONEY, YOU'RE THE WINNER!!\n\n", 30);

		const newGame = await this.waitForInput("ARE YOU STARTING A NEW GAME? (YES OR NO)");
		
		const numPlayers = await this.waitForInput("HOW MANY PEOPLE WILL BE PLAYING? ");
		const playerCount = Math.max(1, Math.min(30, parseInt(numPlayers) || 1));

		// Initialize players
		for (let i = 0; i < playerCount; i++) {
			this.gameState.players.push({
				id: i + 1,
				assets: 2.00,
				glasses: 0,
				signs: 0,
				price: 0,
				bankrupt: false,
				glassesSold: 0,
				income: 0,
				expenses: 0,
				profit: 0
			});
		}

		if (newGame.toUpperCase().startsWith('Y')) {
			await this.showInstructions();
		}

		this.gameState.gamePhase = 'daily';
		await this.playGame();
	}

	private async showInstructions() {
		this.print("");
		await this.typeText("TO MANAGE YOUR LEMONADE STAND, YOU WILL\n", 30);
		await this.typeText("NEED TO MAKE THESE DECISIONS EVERY DAY:\n\n", 30);
		await this.typeText("1. HOW MANY GLASSES OF LEMONADE TO MAKE\n", 30);
		await this.typeText("   (ONLY ONE BATCH IS MADE EACH MORNING)\n", 30);
		await this.typeText("2. HOW MANY ADVERTISING SIGNS TO MAKE\n", 30);
		await this.typeText("   (THE SIGNS COST FIFTEEN CENTS EACH)\n", 30);
		await this.typeText("3. WHAT PRICE TO CHARGE FOR EACH GLASS\n\n", 30);
		await this.typeText("YOU WILL BEGIN WITH $2.00 CASH (ASSETS).\n", 30);
		await this.typeText("BECAUSE YOUR MOTHER GAVE YOU SOME SUGAR,\n", 30);
		await this.typeText("YOUR COST TO MAKE LEMONADE IS TWO CENTS\n", 30);
		await this.typeText("A GLASS (THIS MAY CHANGE IN THE FUTURE).\n\n", 30);
		
		await this.waitForInput("PRESS SPACE BAR TO CONTINUE...");
		
		this.print("");
		await this.typeText("YOUR EXPENSES ARE THE SUM OF THE COST OF\n", 30);
		await this.typeText("THE LEMONADE AND THE COST OF THE SIGNS.\n\n", 30);
		await this.typeText("YOUR PROFITS ARE THE DIFFERENCE BETWEEN\n", 30);
		await this.typeText("THE INCOME FROM SALES AND YOUR EXPENSES.\n\n", 30);
		await this.typeText("THE NUMBER OF GLASSES YOU SELL EACH DAY\n", 30);
		await this.typeText("DEPENDS ON THE PRICE YOU CHARGE, AND ON\n", 30);
		await this.typeText("THE NUMBER OF ADVERTISING SIGNS YOU USE.\n\n", 30);
		await this.typeText("KEEP TRACK OF YOUR ASSETS, BECAUSE YOU\n", 30);
		await this.typeText("CAN'T SPEND MORE MONEY THAN YOU HAVE!\n\n", 30);
		
		await this.waitForInput("PRESS SPACE BAR TO CONTINUE...");
	}

	private async playGame() {
		while (this.gameState.gamePhase !== 'gameover') {
			this.gameState.day++;
			
			await this.showWeatherReport();
			await this.showDayInfo();
			await this.handleRandomEvents();
			
			if (this.gameState.weatherEvents.thunderstorm) {
				await this.handleThunderstorm();
				continue;
			}
			
			await this.getPlayerDecisions();
			await this.calculateResults();
			await this.showDailyResults();
			
			if (this.checkGameOver()) {
				this.gameState.gamePhase = 'gameover';
				await this.showGameOver();
			}
		}
	}

	private async showWeatherReport() {
		// Generate weather
		const rand = Math.random();
		if (rand < 0.6) {
			this.gameState.weather = 2; // Sunny
		} else if (rand < 0.8) {
			this.gameState.weather = 10; // Cloudy
		} else {
			this.gameState.weather = 7; // Hot
		}
		
		if (this.gameState.day < 3) {
			this.gameState.weather = 2; // Always sunny first few days
		}

		this.print("");
		this.print("┌────────────────────────────────────────┐");
		this.print("│    LEMONSVILLE WEATHER REPORT          │");
		this.print("└────────────────────────────────────────┘");
		this.print("");
		
		const weatherArt = this.getWeatherArt();
		for (const line of weatherArt) {
			this.print(line);
		}
		this.print("");
	}

	private getWeatherArt(): string[] {
		switch (this.gameState.weather) {
			case 2: // Sunny
				return [
					"                    ☀️",
					"               SUNNY",
					"                    ",
					"     Perfect weather for",
					"     selling lemonade!"
				];
			case 7: // Hot
				return [
					"              ☀️  ☀️  ☀️",
					"             HOT AND DRY",
					"                    ",
					"     Customers will be",
					"        thirsty today!"
				];
			case 10: // Cloudy
				return [
					"         ☁️    ☁️    ☁️",
					"              CLOUDY",
					"                    ",
					"     Sales might be",
					"        slower today"
				];
			case 5: // Thunderstorm
				return [
					"       ⚡ ☁️ ⚡ ☁️ ⚡",
					"         THUNDERSTORMS!",
					"                    ",
					"     All lemonade",
					"      will be ruined!"
				];
			default:
				return ["", "WEATHER UNKNOWN", ""];
		}
	}

	private async showDayInfo() {
		let cost = 2;
		if (this.gameState.day > 2) cost = 4;
		if (this.gameState.day > 6) cost = 5;

		this.print(`ON DAY ${this.gameState.day}, THE COST OF LEMONADE IS $.0${cost}`);
		this.print("");

		if (this.gameState.day === 3) {
			this.print("*** SPECIAL NOTICE ***");
			this.print("(YOUR MOTHER QUIT GIVING YOU FREE SUGAR)");
			this.print("");
		}
		
		if (this.gameState.day === 7) {
			this.print("*** SPECIAL NOTICE ***");
			this.print("(THE PRICE OF LEMONADE MIX JUST WENT UP)");
			this.print("");
		}
	}

	private async handleRandomEvents() {
		// Reset events
		this.gameState.weatherEvents = {
			streetWork: false,
			thunderstorm: false,
			heatWave: false,
			lightRain: false
		};

		if (this.gameState.day <= 2) return;

		const rand = Math.random();

		if (this.gameState.weather === 10 && rand < 0.25) {
			// Thunderstorm
			this.gameState.weatherEvents.thunderstorm = true;
			this.gameState.weather = 5;
			return;
		}

		if (this.gameState.weather === 10) {
			// Light rain chance
			const rainChance = 30 + Math.floor(Math.random() * 5) * 10;
			this.print("*** WEATHER UPDATE ***");
			this.print(`THERE IS A ${rainChance}% CHANCE OF LIGHT RAIN,`);
			this.print("AND THE WEATHER IS COOLER TODAY.");
			this.print("");
			this.gameState.weatherEvents.lightRain = true;
			return;
		}

		if (this.gameState.weather === 7) {
			this.print("*** WEATHER ALERT ***");
			this.print("A HEAT WAVE IS PREDICTED FOR TODAY!");
			this.print("");
			this.gameState.weatherEvents.heatWave = true;
			return;
		}

		if (rand < 0.25) {
			// Street work
			this.print("*** TRAFFIC ALERT ***");
			this.print("THE STREET DEPARTMENT IS WORKING TODAY.");
			this.print("THERE WILL BE NO TRAFFIC ON YOUR STREET.");
			this.print("");
			this.gameState.weatherEvents.streetWork = true;
		}
	}

	private async handleThunderstorm() {
		this.print("┌────────────────────────────────────────┐");
		this.print("│         *** BREAKING NEWS ***          │");
		this.print("└────────────────────────────────────────┘");
		this.print("");
		this.print("WEATHER REPORT: A SEVERE THUNDERSTORM");
		this.print("HIT LEMONSVILLE EARLIER TODAY, JUST AS");
		this.print("THE LEMONADE STANDS WERE BEING SET UP.");
		this.print("UNFORTUNATELY, EVERYTHING WAS RUINED!!");
		this.print("");
		
		// All players lose their investment but keep their assets
		for (const player of this.gameState.players) {
			player.glassesSold = 0;
			player.income = 0;
			player.expenses = 0;
			player.profit = 0;
		}
		
		await this.waitForInput("PRESS SPACE BAR TO CONTINUE...");
	}

	private async getPlayerDecisions() {
		for (let i = 0; i < this.gameState.players.length; i++) {
			const player = this.gameState.players[i];
			
			this.print("╔══════════════════════════════════════════════════════╗");
			this.print(`║           LEMONADE STAND ${player.id}                          ║`);
			this.print(`║           ASSETS: $${player.assets.toFixed(2)}                        ║`);
			this.print("╚══════════════════════════════════════════════════════╝");
			this.print("");
			
			if (player.bankrupt) {
				this.print("*** BANKRUPTCY NOTICE ***");
				this.print("YOU ARE BANKRUPT, NO DECISIONS");
				this.print("FOR YOU TO MAKE.");
				this.print("");
				continue;
			}

			let cost = 2;
			if (this.gameState.day > 2) cost = 4;
			if (this.gameState.day > 6) cost = 5;
			const costPerGlass = cost * 0.01;

			// Get glasses to make
			while (true) {
				const glassesInput = await this.waitForInput("HOW MANY GLASSES OF LEMONADE DO YOU\nWISH TO MAKE? ");
				const glasses = parseInt(glassesInput);
				
				if (isNaN(glasses) || glasses < 0 || glasses > 1000) {
					this.print("*** ERROR ***");
					this.print("COME ON, LET'S BE REASONABLE NOW!!!");
					this.print("TRY AGAIN");
					continue;
				}
				
				if (glasses * costPerGlass > player.assets) {
					this.print("*** INSUFFICIENT FUNDS ***");
					this.print(`THINK AGAIN!!! YOU HAVE ONLY $${player.assets.toFixed(2)}`);
					this.print(`IN CASH AND TO MAKE ${glasses} GLASSES OF`);
					this.print(`LEMONADE YOU NEED $${(glasses * costPerGlass).toFixed(2)} IN CASH.`);
					continue;
				}
				
				player.glasses = glasses;
				break;
			}

			// Get advertising signs
			while (true) {
				const signsInput = await this.waitForInput("HOW MANY ADVERTISING SIGNS (15 CENTS\nEACH) DO YOU WANT TO MAKE? ");
				const signs = parseInt(signsInput);
				
				if (isNaN(signs) || signs < 0 || signs > 50) {
					this.print("*** ERROR ***");
					this.print("COME ON, BE REASONABLE!!! TRY AGAIN.");
					continue;
				}
				
				const remainingCash = player.assets - (player.glasses * costPerGlass);
				if (signs * 0.15 > remainingCash) {
					this.print("*** INSUFFICIENT FUNDS ***");
					this.print(`THINK AGAIN, YOU HAVE ONLY $${remainingCash.toFixed(2)}`);
					this.print("IN CASH LEFT AFTER MAKING YOUR LEMONADE.");
					continue;
				}
				
				player.signs = signs;
				break;
			}

			// Get price
			while (true) {
				const priceInput = await this.waitForInput("WHAT PRICE (IN CENTS) DO YOU WISH TO\nCHARGE FOR LEMONADE? ");
				const price = parseInt(priceInput);
				
				if (isNaN(price) || price < 0 || price > 100) {
					this.print("*** ERROR ***");
					this.print("COME ON, BE REASONABLE!!! TRY AGAIN.");
					continue;
				}
				
				player.price = price;
				break;
			}

			this.print("");
			this.print("DECISION SUMMARY:");
			this.print(`  GLASSES TO MAKE: ${player.glasses}`);
			this.print(`  SIGNS TO MAKE: ${player.signs}`);
			this.print(`  PRICE PER GLASS: ${player.price}¢`);
			this.print("");

			const changeAnswer = await this.waitForInput("WOULD YOU LIKE TO CHANGE ANYTHING? (Y/N) ");
			if (changeAnswer.toUpperCase().startsWith('Y')) {
				i--; // Repeat this player
			}
		}
	}

	private async calculateResults() {
		for (const player of this.gameState.players) {
			if (player.bankrupt) continue;

			let cost = 2;
			if (this.gameState.day > 2) cost = 4;
			if (this.gameState.day > 6) cost = 5;
			const costPerGlass = cost * 0.01;

			// Calculate demand based on price and advertising
			let demand = 30; // Base demand
			
			if (player.price >= 10) {
				demand = (10 - player.price) / 10 * 0.8 * 30 + 30;
			} else {
				demand = ((10 * 10) * 30) / (player.price * player.price);
			}
			
			// Advertising effect
			const adEffect = 1 - Math.exp(-player.signs * 0.5);
			demand = demand * (1 + adEffect);
			
			// Weather effects
			if (this.gameState.weatherEvents.heatWave) {
				demand *= 2;
			} else if (this.gameState.weatherEvents.lightRain) {
				const rainReduction = (30 + Math.floor(Math.random() * 5) * 10) / 100;
				demand *= (1 - rainReduction);
			} else if (this.gameState.weatherEvents.streetWork) {
				demand *= 0.1;
			}

			demand = Math.floor(demand);
			player.glassesSold = Math.min(demand, player.glasses);

			// Calculate financials
			player.income = player.glassesSold * player.price * 0.01;
			player.expenses = player.signs * 0.15 + player.glasses * costPerGlass;
			player.profit = player.income - player.expenses;
			player.assets += player.profit;

			// Check for bankruptcy
			if (player.assets < costPerGlass) {
				player.bankrupt = true;
			}
		}
	}

	private async showDailyResults() {
		this.print("");
		this.print("╔══════════════════════════════════════════════════════╗");
		this.print("║       $$ LEMONSVILLE DAILY FINANCIAL REPORT $$      ║");
		this.print("╚══════════════════════════════════════════════════════╝");
		this.print("");

		for (const player of this.gameState.players) {
			if (player.bankrupt && player.assets < 0.01) {
				this.print(`   STAND ${player.id}   *** BANKRUPT ***`);
				this.print("");
				continue;
			}

			this.print(`╔═══════════════════════════════════════════════════════════════════════════╗`);
			this.print(`║   DAY ${this.gameState.day.toString().padStart(2)}                                        STAND ${player.id}                    ║`);
			this.print(`╚═══════════════════════════════════════════════════════════════════════════╝`);
			this.print("");
			this.print(`  ${player.glassesSold.toString().padStart(3)}       GLASSES SOLD`);
			this.print(`$${(player.price / 100).toFixed(2)}       PER GLASS                   INCOME $${player.income.toFixed(2)}`);
			this.print("");
			this.print(`  ${player.glasses.toString().padStart(3)}       GLASSES MADE`);
			this.print(`  ${player.signs.toString().padStart(3)}       SIGNS MADE                 EXPENSES $${player.expenses.toFixed(2)}`);
			this.print("");
			this.print(`                PROFIT  ${player.profit.toFixed(2)}`);
			this.print(`                ASSETS  ${player.assets.toFixed(2)}`);
			this.print("");

			if (player.bankrupt) {
				this.print(`  *** BANKRUPTCY NOTICE ***`);
				this.print(`  YOU DON'T HAVE ENOUGH MONEY LEFT`);
				this.print(`  TO STAY IN BUSINESS - YOU'RE BANKRUPT!`);
				this.print("");
			}
		}

		await this.waitForInput("PRESS SPACE BAR TO CONTINUE...");
	}

	private checkGameOver(): boolean {
		// Game continues indefinitely or until all players are bankrupt
		const activePlayers = this.gameState.players.filter(p => !p.bankrupt);
		return activePlayers.length === 0 || this.gameState.day >= 30;
	}

	private async showGameOver() {
		this.print("");
		this.print("╔══════════════════════════════════════════════════════╗");
		this.print("║                   GAME OVER!                        ║");
		this.print("╚══════════════════════════════════════════════════════╝");
		this.print("");
		
		// Show final standings with retro ASCII art
		const sortedPlayers = [...this.gameState.players].sort((a, b) => b.assets - a.assets);
		
		this.print("╔═══════════════════════════════════════════════════════════════════════════╗");
		this.print("║                          FINAL STANDINGS                                 ║");
		this.print("╚═══════════════════════════════════════════════════════════════════════════╝");
		this.print("");
		
		for (let i = 0; i < sortedPlayers.length; i++) {
			const player = sortedPlayers[i];
			const position = i + 1;
			let trophy = "";
			
			switch (position) {
				case 1:
					trophy = "🏆";
					break;
				case 2:
					trophy = "🥈";
					break;
				case 3:
					trophy = "🥉";
					break;
				default:
					trophy = "  ";
			}
			
			this.print(`${trophy} ${position.toString().padStart(2)}. STAND ${player.id}: ${player.assets.toFixed(2)}`);
		}
		
		this.print("");
		
		// Show winner celebration
		if (sortedPlayers.length > 0 && sortedPlayers[0].assets > 2.00) {
			this.print("*** CONGRATULATIONS! ***");
			this.print(`STAND ${sortedPlayers[0].id} WINS WITH ${sortedPlayers[0].assets.toFixed(2)}!`);
			this.print("");
			
			// ASCII celebration
			const celebration = `
                    🎉 WINNER! 🎉
                       
                   🍋 🏆 🍋
                  
               LEMONADE CHAMPION!
            `;
			
			for (const line of celebration.split('\n')) {
				this.print(line);
			}
		}
		
		this.print("");
		const playAgain = await this.waitForInput("WOULD YOU LIKE TO PLAY AGAIN? (Y/N) ");
		
		if (playAgain.toUpperCase().startsWith('Y')) {
			this.initializeGame();
			await this.showIntroSequence();
			await this.startGame();
		} else {
			this.print("");
			this.print("╔══════════════════════════════════════════════════════╗");
			this.print("║           THANKS FOR PLAYING LEMONADE STAND!        ║");
			this.print("║                                                      ║");
			this.print("║         COPYRIGHT 1979 APPLE COMPUTER INC.          ║");
			this.print("║         OBSIDIAN ADAPTATION 2025 M. REIDER          ║");
			this.print("╚══════════════════════════════════════════════════════╝");
			this.print("");
			this.print("PRESS ESC OR CLOSE THIS VIEW TO EXIT.");
		}
	}

	async onClose() {
		if (this.cursorInterval) {
			clearInterval(this.cursorInterval);
		}
	}
}

export default class LemonadeStandPlugin extends Plugin {
	async onload() {
		// Register the view
		this.registerView(
			VIEW_TYPE_LEMONADE,
			(leaf) => new LemonadeStandView(leaf)
		);

		// Add ribbon icon - using a lemon/citrus icon
		this.addRibbonIcon('citrus', 'Play Lemonade Stand', () => {
			this.activateView();
		});
	}

	async activateView() {
		const { workspace } = this.app;
		
		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_LEMONADE);

		if (leaves.length > 0) {
			// A view is already open, focus it
			leaf = leaves[0];
		} else {
			// Create new view in the main area
			leaf = workspace.getLeaf('tab');
			await leaf.setViewState({ type: VIEW_TYPE_LEMONADE, active: true });
		}

		// Focus the view
		workspace.revealLeaf(leaf);
	}

	onunload() {
		// Cleanup
	}
}