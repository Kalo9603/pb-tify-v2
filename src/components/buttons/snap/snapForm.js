import { html, css } from "https://esm.sh/lit-element";
import { UtBase } from "../../../utilities/base.js";
import { validateCoordinates } from "../../../utilities/lib/utils.js";
import "./preview.js";

export class CpSnapForm extends UtBase {
	static get properties() {
		return {
			region: { type: String },
			width: { type: Number },
			height: { type: Number },
			coordX1: { type: Number },
			coordY1: { type: Number },
			coordX2: { type: Number },
			coordY2: { type: Number },
			rotation: { type: Number },
			mirror: { type: Boolean },
		};
	}

	constructor() {
		super();
		this._applyStyles();
		this.region = "full";
		this.width = 0;
		this.height = 0;
		this.coordX1 = 0;
		this.coordY1 = 0;
		this.coordX2 = 0;
		this.coordY2 = 0;
		this.rotation = 0;
		this.mirror = false;
	}

	_applyStyles() {
		if (!this.__stylesInjected) {
			const style = document.createElement("style");
			style.textContent = this.constructor.styles.cssText;
			this.appendChild(style);
			this.__stylesInjected = true;
		}
	}

	onRegionChange(e) {
		this.region = e.target.value;
		if (this.region !== "coordinates" && this.region !== "coordinates%") {
			this.coordX1 = 0;
			this.coordY1 = 0;
			this.coordX2 = 0;
			this.coordY2 = 0;
		}
		this._emitChange();
	}

	onCoordChange(e, coordName) {
		const val = Number(e.target.value);
		this[coordName] = val;

		const coords = validateCoordinates(
			this.region,
			this.width,
			this.height,
			this.coordX1,
			this.coordY1,
			this.coordX2,
			this.coordY2
		);

		this.coordX1 = coords.x1;
		this.coordY1 = coords.y1;
		this.coordX2 = coords.x2;
		this.coordY2 = coords.y2;

		this._emitChange();
	}

	onRotationChange(e) {
		let val = Number(e.target.value);
		val = Math.min(Math.max(val, 0), 360);
		this.rotation = val;
		this._emitChange();
	}

	onMirrorChange(e) {
		this.mirror = e.target.checked;
		this._emitChange();
	}

	_emitChange() {
		this.dispatchEvent(
			new CustomEvent("region-change", {
				detail: {
					region: this.region,
					coordX1: this.coordX1,
					coordY1: this.coordY1,
					coordX2: this.coordX2,
					coordY2: this.coordY2,
					rotation: this.rotation,
					mirror: this.mirror,
				},
				bubbles: true,
				composed: true,
			})
		);
	}

	static styles = css`
		:host {
			display: block;
			font-family: system-ui, sans-serif;
			color: #111;
			font-size: 14px;
		}

		.form-wrapper {
			display: flex;
			flex-direction: column;
			gap: 1.5rem;
		}

		.form-row {
			display: flex;
			gap: 2rem;
			align-items: flex-start;
		}

		.region-block,
		.rotation-block {
			display: flex;
			flex-direction: column;
			gap: 1rem;
			flex: 1;
		}

		.region-select label,
		.rotation-input label,
		.mirror-label {
			font-weight: 600;
			color: #111;
		}

		.region-select select {
			width: 10em;
			padding: 0.4em 0.6em;
			font-size: 0.9em;
			border-radius: 9999px;
			border: 1px solid #ccc;
			background-color: #fff;
			color: #111;
			box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
			transition: border-color 0.2s, box-shadow 0.2s;
			font-family: system-ui, sans-serif;
		}

		.region-select select:focus {
			outline: none;
			border-color: #0078d7;
			box-shadow: 0 0 0 2px rgba(0, 120, 215, 0.25);
		}

		input[type="number"] {
			width: 5em;
			padding: 0.4em 0.6em;
			font-size: 0.9em;
			border-radius: 9999px;
			border: 1px solid #ccc;
			background-color: #fff;
			color: #111;
			box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
			transition: border-color 0.2s, box-shadow 0.2s;
			font-family: system-ui, sans-serif;
		}

		input[type="number"]:focus {
			outline: none;
			border-color: #0078d7;
			box-shadow: 0 0 0 2px rgba(0, 120, 215, 0.25);
		}

		label {
			display: flex;
			align-items: center;
			gap: 0.3em;
			font-size: 0.9em;
			font-weight: 400;
			color: #333;
		}

		.coords-container {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
		}

		.coords-group {
			display: flex;
			gap: 1rem;
		}

		.rotation-input {
			display: flex;
			flex-direction: column;
			gap: 0.5em;
		}

		.mirror-label {
			display: flex;
			align-items: center;
			gap: 0.4em;
			font-weight: 500;
		}

		.mirror-label input[type="checkbox"] {
			width: 1em;
			height: 1em;
		}

		cp-preview {
			margin-top: 1.5rem;
			align-self: flex-start;
		}
    
	`;

	render() {
		const stepVal = this.region === "coordinates%" ? 0.01 : 1;

		return html`
			<div class="form-wrapper">
				<div class="form-row">
					<div class="region-block">
						<div class="region-select">
							<label for="r-select">Region</label>
							<select
								id="r-select"
								@change="${this.onRegionChange}"
								.value="${this.region}"
							>
								<option value="full">full</option>
								<option value="square">square</option>
								<option value="coordinates">coordinates</option>
								<option value="coordinates%">coordinates %</option>
							</select>
						</div>

						${this.region === "coordinates" || this.region === "coordinates%"
							? html`
									<div class="coords-container">
										<div class="coords-group">
											<label>
												x<sub>1</sub>:
												<input
													type="number"
													.value="${this.coordX1}"
													step="${stepVal}"
													@input="${(e) => this.onCoordChange(e, "coordX1")}"
												/>
											</label>
											<label>
												y<sub>1</sub>:
												<input
													type="number"
													.value="${this.coordY1}"
													step="${stepVal}"
													@input="${(e) => this.onCoordChange(e, "coordY1")}"
												/>
											</label>
										</div>

										<div class="coords-group">
											<label>
												x<sub>2</sub>:
												<input
													type="number"
													.value="${this.coordX2}"
													step="${stepVal}"
													@input="${(e) => this.onCoordChange(e, "coordX2")}"
												/>
											</label>
											<label>
												y<sub>2</sub>:
												<input
													type="number"
													.value="${this.coordY2}"
													step="${stepVal}"
													@input="${(e) => this.onCoordChange(e, "coordY2")}"
												/>
											</label>
										</div>
									</div>
							  `
							: null}
					</div>

					<div class="rotation-block">
						<div class="rotation-input">
							<label for="rotation-input">Rotation</label>
							<input
								id="rotation-input"
								type="number"
								min="0"
								max="360"
								.value="${this.rotation}"
								@input="${this.onRotationChange}"
							/>
						</div>

						<label class="mirror-label">
              <input
                type="checkbox"
                class="styled-checkbox"
                .checked="${this.mirror}"
                @change="${this.onMirrorChange}"
              />
							Flip before rotation
						</label>
					</div>
				</div>

				<cp-preview
					.region="${this.region}"
					.width="${this.width}"
					.height="${this.height}"
					.coordX1="${this.coordX1}"
					.coordY1="${this.coordY1}"
					.coordX2="${this.coordX2}"
					.coordY2="${this.coordY2}"
					.rotation="${this.rotation}"
					.mirror="${this.mirror}"
				></cp-preview>
			</div>
		`;
	}
}

customElements.define("cp-snapform", CpSnapForm);
