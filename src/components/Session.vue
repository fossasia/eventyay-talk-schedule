<template lang="pug">
a.c-linear-schedule-session(:class="{faved}", :style="style", :href="link", @click="onSessionLinkClick($event, session)", :target="linkTarget")
	.time-box
		.start(:class="{'has-ampm': hasAmPm}")
			.time {{ startTime.time }}
			.ampm(v-if="startTime.ampm") {{ startTime.ampm }}
		.duration {{ getPrettyDuration(session.start, session.end) }}
		.session-date {{ getPrettyDate(session.start) }}
		.buffer
		.is-live(v-if="isLive") live
	.info
		.title {{ getLocalizedString(session.title) }}
		.speakers(v-if="session.speakers")
			.avatars
				template(v-for="speaker of session.speakers")
					.speaker-info(:key="speaker.code")
						img(v-if="speaker.avatar", :src="speaker.avatar")
						.names {{ speaker.name }}
		.tags-box
			.tags(v-for="tag_item of session.tags", :key="tag_item.id")
				.tag-item(:style="{'background-color': tag_item.color, 'color': getContrastColor(tag_item.color)}") {{ tag_item.tag }}
		.abstract(v-if="showAbstract", v-html="abstract")
		.bottom-info
			.track(v-if="session.track") {{ getLocalizedString(session.track.name) }}
			.room(v-if="showRoom && session.room") {{ getLocalizedString(session.room.name) }}
	.session-icons
		.fav-count(v-if="session.fav_count > 0 && isLinearSchedule") {{ session.fav_count > 99 ? "99+" : session.fav_count  }}
		bunt-icon-button.btn-fav-container(@click.prevent.stop="toggleFav")
			svg.star(viewBox="0 0 24 24", ref="star")
				path(d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z")
		svg.do-not-record(v-if="session.do_not_record", viewBox="0 0 116.59076 116.59076", width="4116.59076mm", height="116.59076mm", fill="none", xmlns="http://www.w3.org/2000/svg")
			g(transform="translate(-9.3465481,-5.441411)")
				rect(style="fill:#000000;fill-opacity;stroke:none;stroke-width:11.2589;stroke-linecap:round;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill", width="52.753284", height="39.619537", x="35.496307", y="43.927021", rx="5.5179553", ry="7.573648")
				path(style="fill:#000000;fill-opacity:1;stroke:none;stroke-width:18.7997;stroke-linecap:round;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill", d="M 99.787546,47.04792 V 80.425654 L 77.727407,63.736793 Z")
				path(style="fill:none;stroke:#b23e65;stroke-width:12;stroke-linecap:round;stroke-dasharray:none;stroke-opacity:1;paint-order:markers stroke fill", d="m 35.553146,95.825578 64.177559,-64.17757 m 16.294055,32.08879 A 48.382828,48.382828 0 0 1 67.641925,112.11961 48.382828,48.382828 0 0 1 19.259099,63.736798 48.382828,48.382828 0 0 1 67.641925,15.353968 48.382828,48.382828 0 0 1 116.02476,63.736798 Z")

</template>
<script>
import moment from 'moment-timezone'
import MarkdownIt from 'markdown-it'
import { getLocalizedString, getPrettyDuration, getPrettyDate } from 'utils'

const markdownIt = MarkdownIt({
	linkify: true,
	breaks: true
})

export default {
	inject: {
		eventUrl: { default: null },
		linkTarget: { default: '_self' },
		generateSessionLinkUrl: {
			default () {
				return ({eventUrl, session}) => `${eventUrl}talk/${session.id}/`
			}
		},
		onSessionLinkClick: {
			default () {
				return () => {}
			}
		}
	},
	props: {
		session: Object,
		showAbstract: {
			type: Boolean,
			default: true
		},
		showRoom: {
			type: Boolean,
			default: true
		},
		faved: {
			type: Boolean,
			default: false
		},
		hasAmPm: {
			type: Boolean,
			default: false
		},
		isLinearSchedule: Boolean
	},
	data () {
		return {
			getPrettyDuration,
			getLocalizedString,
			getPrettyDate,
		}
	},
	computed: {
		link () {
			return this.generateSessionLinkUrl({eventUrl: this.eventUrl, session: this.session})
		},
		style () {
			return {
				'--track-color': this.session.track?.color || 'var(--pretalx-clr-primary)'
			}
		},
		startTime () {
			// check if 12h or 24h locale
			if (this.hasAmPm) {
				return {
					time: this.session.start.format('h:mm'),
					ampm: this.session.start.format('A')
				}
			} else {
				return {
					time: moment(this.session.start).format('LT')
				}
			}
		},
		isLive () {
			return moment(this.session.start).isBefore(this.now) && moment(this.session.end).isAfter(this.now)
		},
		abstract () {
			try {
				return markdownIt.renderInline(this.session.abstract)
			} catch (error) {
				return this.session.abstract
			}
		}
	},
	methods: {
		getContrastColor (bgColor) {
			if (!bgColor) {
				return ''
			}
			bgColor = bgColor.replace('#', '')
			const r = parseInt(bgColor.slice(0, 2), 16)
			const g = parseInt(bgColor.slice(2, 4), 16)
			const b = parseInt(bgColor.slice(4, 6), 16)
			const brightness = (r * 299 + g * 587 + b * 114) / 1000

			// If the brightness is over 128, return black. Otherwise, return white
			return brightness > 128 ? 'black' : 'white'
		},
		toggleFav () {
			if (this.faved) {
				this.$emit('unfav', this.session.id)
			} else {
				this.$emit('fav', this.session.id)
			}
			this.$refs.star.classList.add('rotate-star')
			setTimeout(() => {
				this.$refs.star.classList.remove('rotate-star')
			}, 400)
		}
	}
}
</script>
<style lang="stylus">
.c-linear-schedule-session, .break
	z-index: 10
	display: flex
	min-width: 300px
	min-height: 96px
	margin: 8px
	overflow: hidden
	color: $clr-primary-text-light
	position: relative
	.time-box
		min-width: 75px
		max-width: 75px
		box-sizing: border-box
		background-color: var(--track-color)
		padding: 12px 16px 8px 12px
		border-radius: 6px 0 0 6px
		display: flex
		flex-direction: column
		align-items: center
		.start
			color: $clr-primary-text-dark
			font-size: 16px
			font-weight: 600
			margin-bottom: 8px
			display: flex
			flex-direction: column
			align-items: flex-end
			&.has-ampm
				align-self: stretch
			.ampm
				font-weight: 400
				font-size: 13px
		.duration
			color: $clr-secondary-text-dark
			margin-bottom: 8px
		.session-date
			color: $clr-primary-text-dark
			font-size: 13px
			font-weight: 600
			display: flex
			flex-direction: column
			align-items: flex-end
		.buffer
			flex: auto
		.is-live
			align-self: stretch
			text-align: center
			font-weight: 600
			padding: 2px 4px
			border-radius: 4px
			margin: 0 -10px 0 -6px // HACK
			background-color: $clr-danger
			color: $clr-primary-text-dark
			letter-spacing: 0.5px
			text-transform: uppercase
	.info
		flex: auto
		display: flex
		flex-direction: column
		padding: 8px
		border: border-separator()
		border-left: none
		border-radius: 0 6px 6px 0
		background-color: $clr-white
		min-width: 0
		.title
			font-size: 16px
			font-weight: 500
			margin-bottom: 4px
		.speakers
			color: $clr-secondary-text-light
			display: flex
			.avatars
				.speaker-info
					display: flex
					flex: none
					img
						background-color: $clr-white
						border-radius: 50%
						height: 24px
						width: @height
						margin: 0 8px 0 0
						object-fit: cover
					.names
						line-height: 24px
		.abstract
			margin: 8px 0 12px 0
			// TODO make this take up more space if available?
			display: -webkit-box
			-webkit-line-clamp: 3
			-webkit-box-orient: vertical
			overflow: hidden
		.bottom-info
			flex: auto
			display: flex
			align-items: flex-end
			.track
				flex: 1
				color: var(--track-color)
				ellipsis()
				margin-right: 4px
			.room
				flex: 1
				text-align: right
				color: $clr-secondary-text-light
				ellipsis()
	.do-not-record
		width: 24px
		height: 24px
	.session-icons
		position: absolute
		top: 2px
		right: 2px
		display: flex
		.do-not-record
			padding: 6px 6px 6px 0
		.btn-fav-container
			margin-top: 2px
			display: none
			icon-button-style(style: clear)
			padding: 2px
			width: 32px
			height: 32px
			svg.star
				height: 20px
				width: 20px
				path
					fill: none
					stroke: #ffa000
					stroke-width: 1px
					vector-effect: non-scaling-stroke
	&.faved
		.btn-fav-container
			display: inline-flex
			svg.star
				filter: drop-shadow(0 0 2px rgba(0 0 0 0.17))
				path
					fill: #ffa000
	&:hover
		.info
			border: 1px solid var(--track-color)
			border-left: none
			.title
				color: var(--pretalx-clr-primary)
		.btn-fav-container
			display: inline-flex
	// +below('m')
	// 	min-width: 0
	.fav-count
		border: 1px solid
		border-radius: 50%
		margin-top: 5px
		width: 25px
		height: 25px
		display: flex
		justify-content: center
		align-items: center
		text-align: center
		background-color: var(--track-color)
		color: $clr-primary-text-dark

	.tags-box
		display: flex
		margin: 5px 0px
		.tags
			margin: 0px 2px
			.tag-item
				padding: 3px
	svg.star.rotate-star
		animation: rotate 0.4s
	@keyframes rotate
		0%
			transform: rotate(0deg)
		100%
			transform: rotate(72deg)
</style>
