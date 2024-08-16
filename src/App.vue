<template lang="pug">
.pretalx-schedule(:style="{'--scrollparent-width': scrollParentWidth + 'px', '--schedule-max-width': scheduleMaxWidth + 'px', '--pretalx-sticky-date-offset': days && days.length > 1 ? '48px' : '0px'}", :class="showGrid ? ['grid-schedule'] : ['list-schedule']")
	template(v-if="scheduleError")
		.schedule-error
			.error-message An error occurred while loading the schedule. Please try again later.
	template(v-else-if="schedule && sessions")
		.settings
			app-dropdown(v-for="item in filter", :key="item.id", :lazy="true")
				template(slot="toggler")
					span {{item.title}}
				app-dropdown-content
					app-dropdown-item(v-for="track in item.data", :key="track.value")
						.checkbox-line(:style="{'--track-color': track.color}")
							bunt-checkbox(type="checkbox", :label="track.label", :name="track.value + track.label", v-model="track.selected", :value="track.value", @input="onlyFavs = false")
			bunt-button.fav-toggle(v-if="favs.length", @click="onlyFavs = !onlyFavs; if (onlyFavs) resetFiltered()", :class="onlyFavs ? ['active'] : []")
				svg#star(viewBox="0 0 24 24")
					polygon(
						:style="{fill: '#FFA000', stroke: '#FFA000'}"
						points="14.43,10 12,2 9.57,10 2,10 8.18,14.41 5.83,22 12,17.31 18.18,22 15.83,14.41 22,10"
					)
				template {{ favs.length }}
			template(v-if="!inEventTimezone")
				bunt-select(name="timezone", :options="[{id: schedule.timezone, label: schedule.timezone}, {id: userTimezone, label: userTimezone}]", v-model="currentTimezone", @blur="saveTimezone")
			template(v-else)
				div.timezone-label.bunt-tab-header-item {{ schedule.timezone }}
			bunt-select.hide-select(v-if="!showGrid" style="margin-left: 0px" name="sort" :options="sortOptions" v-model="selectedSort" label="Sort by")
			bunt-button.sort-icon(@click="toggleSortOptions", tooltip="Sort By")
				svg(viewBox="0 0 301.219 301.219")
					path(d="M159.365,23.736v-10c0-5.523-4.477-10-10-10H10c-5.523,0-10,4.477-10,10v10c0,5.523,4.477,10,10,10h139.365C154.888,33.736,159.365,29.259,159.365,23.736z")
					path(d="M130.586,66.736H10c-5.523,0-10,4.477-10,10v10c0,5.523,4.477,10,10,10h120.586c5.523,0,10-4.477,10-10v-10C140.586,71.213,136.109,66.736,130.586,66.736z")
					path(d="M111.805,129.736H10c-5.523,0-10,4.477-10,10v10c0,5.523,4.477,10,10,10h101.805c5.523,0,10-4.477,10-10v-10C121.805,134.213,117.328,129.736,111.805,129.736z")
					path(d="M93.025,199.736H10c-5.523,0-10,4.477-10,10v10c0,5.523,4.477,10,10,10h83.025c5.522,0,10-4.477,10-10v-10C103.025,204.213,98.548,199.736,93.025,199.736z")
					path(d="M74.244,262.736H10c-5.523,0-10,4.477-10,10v10c0,5.523,4.477,10,10,10h64.244c5.522,0,10-4.477,10-10v-10C84.244,267.213,79.767,262.736,74.244,262.736z")
					path(d="M298.29,216.877l-7.071-7.071c-1.875-1.875-4.419-2.929-7.071-2.929c-2.652,0-5.196,1.054-7.072,2.929l-34.393,34.393V18.736c0-5.523-4.477-10-10-10h-10c-5.523,0-10,4.477-10,10v225.462l-34.393-34.393c-1.876-1.875-4.419-2.929-7.071-2.929c-2.652,0-5.196,1.054-7.071,2.929l-7.072,7.071c-3.904,3.905-3.904,10.237,0,14.142l63.536,63.536c1.953,1.953,4.512,2.929,7.071,2.929c2.559,0,5.119-0.976,7.071-2.929l63.536-63.536C302.195,227.113,302.195,220.781,298.29,216.877z")
				div.dropdown-sort-menu(v-if="showSortOptions" @click.stop v-on-clickaway="toggleSortOptions")
					div(v-for="sort in sortOptions", :key="sort.id")
						input(type="radio" :name="sort.label", v-model="selectedSortIcon", :value="sort.id" @change="handleSortSelected")
						label {{ sort.id }}
			bunt-button.fav-toggle(@click="resetAllFiltered", tooltip="Clear All Filters")
				svg(viewBox="0 0 24 24")
					path(
						d="M14.76 20.83L17.6 18l-2.84-2.83l1.41-1.41L19 16.57l2.83-2.81l1.41 1.41L20.43 18l2.81 2.83l-1.41 1.41L19 19.4l-2.83 2.84zM12 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L8.29 18.7a.99.99 0 0 1-.29-.83V12h-.03L2.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L12.03 12z"
					)
		bunt-tabs.days(v-if="days && days.length > 1", :active-tab="currentDay && currentDay.format()", ref="tabs" :class="showGrid? ['grid-tabs'] : ['list-tabs']")
			bunt-tab(v-for="day in days", :id="day.format()", :header="day.format(dateFormat)", @selected="changeDay(day)")
		grid-schedule(v-if="showGrid",
			:sessions="sessions",
			:rooms="rooms",
			:currentDay="currentDay",
			:now="now",
			:scrollParent="scrollParent",
			:favs="favs",
			@changeDay="currentDay = $event",
			@fav="fav($event)",
			@unfav="unfav($event)")
		linear-schedule(v-else,
			:sessions="sessions",
			:rooms="rooms",
			:currentDay="currentDay",
			:now="now",
			:scrollParent="scrollParent",
			:favs="favs",
			@changeDay="currentDay = $event",
			@fav="fav($event)",
			@unfav="unfav($event)",
			:sortBy="sortBy",)
		.modal(v-if="showModal")
			.modal-content
				.modal-header
					.h3.modal-title Warning
				.modal-body.p Please login to add a session to your personal schedule.
				.modal-footer
					.button(@click="closeModal") OK
	bunt-progress-circular(v-else, size="huge", :page="true")
</template>
<script>
import Vue from 'vue'
import { mixin as clickaway } from 'vue-clickaway'
import Buntpapier from 'buntpapier'
import moment from 'moment-timezone'
import LinearSchedule from 'components/LinearSchedule'
import GridSchedule from 'components/GridSchedule'
import { findScrollParent, getLocalizedString } from 'utils'
import AppDropdown from 'components/AppDropdown.vue'
import AppDropdownContent from 'components/AppDropdownContent.vue'
import AppDropdownItem from 'components/AppDropdownItem.vue'

Vue.use(Buntpapier)

export default {
	name: 'PretalxSchedule',
	mixins: [clickaway],
	components: { LinearSchedule, GridSchedule, AppDropdown, AppDropdownContent, AppDropdownItem },
	props: {
		eventUrl: String,
		locale: String,
		format: {
			type: String,
			default: 'grid'
		},
		version: {
			type: String,
			default: ''
		}
	},
	provide () {
		return {
			eventUrl: this.eventUrl
		}
	},
	data () {
		return {
			moment,
			getLocalizedString,
			scrollParentWidth: Infinity,
			schedule: null,
			userTimezone: null,
			now: moment(),
			currentDay: null,
			currentTimezone: null,
			showFilterModal: false,
			favs: [],
			allTracks: [],
			onlyFavs: false,
			scheduleError: false,
			selectedTracks: [],
			showModal: false,
			allRooms: [],
			allSessionTypes: [],
			selectedRooms: [],
			selectedSessionTypes: [],
			filter: {
				tracks: {
					refKey: 'track',
					data: [],
					title: 'Tracks'
				},
				rooms: {
					refKey: 'room',
					data: [],
					title: 'Rooms'
				},
				types: {
					refKey: 'session_type',
					data: [],
					title: 'Types'
				}
			},
			sortOptions: [
				{id: 'title', label: 'Title'}, {id: 'time', label: 'Time'}, {id: 'popularity', label: 'Popularity'}
			],
			selectedSort: 'time',
			showSortOptions: false,
			selectedSortIcon: ''
		}
	},
	computed: {
		scheduleMaxWidth () {
			return this.schedule ? Math.min(this.scrollParentWidth, 78 + this.schedule.rooms.length * 650) : this.scrollParentWidth
		},
		showGrid () {
			return this.format !== 'list' // if we can't fit two rooms together, switch to list
		},
		roomsLookup () {
			if (!this.schedule) return {}
			return this.schedule.rooms.reduce((acc, room) => { acc[room.id] = room; return acc }, {})
		},
		tracksLookup () {
			if (!this.schedule) return {}
			return this.schedule.tracks.reduce((acc, t) => { acc[t.id] = t; return acc }, {})
		},
		filteredTracks () {
			let results = null
			Object.keys(this.filter).forEach(key => {
				const refKey = this.filter[key].refKey
				const selectedIds = this.filter[key].data.filter(t => t.selected).map(t => t.value)
				let founds = null
				if (selectedIds.length) {
					if (results && results.length) {
						founds = this.schedule.talks.filter(t => selectedIds.includes(t[refKey]) && results && results.includes(t.id))?.map(i => i.id) || []
					} else {
						founds = this.schedule.talks.filter(t => selectedIds.includes(t[refKey]))?.map(i => i.id) || []
					}
					results = founds
				}
			})
			return results
		},
		speakersLookup () {
			if (!this.schedule) return {}
			return this.schedule.speakers.reduce((acc, s) => { acc[s.code] = s; return acc }, {})
		},
		sessions () {
			if (!this.schedule || !this.currentTimezone) return
			const sessions = []
			const filter = this.filteredTracks
			for (const session of this.schedule.talks.filter(s => s.start)) {
				if (this.onlyFavs && !this.favs.includes(session.code)) continue
				if (filter && !filter.includes(session.id)) continue
				sessions.push({
					id: session.code,
					title: session.title,
					abstract: session.abstract,
					do_not_record: session.do_not_record,
					start: moment.tz(session.start, this.currentTimezone),
					end: moment.tz(session.end, this.currentTimezone),
					speakers: session.speakers?.map(s => this.speakersLookup[s]),
					track: this.tracksLookup[session.track],
					room: this.roomsLookup[session.room],
					fav_count: session.fav_count,
					tags: session.tags
				})
			}
			sessions.sort((a, b) => a.start.diff(b.start))
			return sessions
		},
		rooms () {
			return this.schedule.rooms.filter(r => this.sessions.some(s => s.room === r))
		},
		days () {
			if (!this.sessions) return
			const days = []
			for (const session of this.sessions) {
				if (days[days.length - 1] && days[days.length - 1].isSame(session.start, 'day')) continue
				days.push(session.start.clone().startOf('day'))
			}
			return days
		},
		inEventTimezone () {
			if (!this.schedule || !this.schedule.talks) return false
			const example = this.schedule.talks[0].start
			return moment.tz(example, this.userTimezone).format('Z') === moment.tz(example, this.schedule.timezone).format('Z')
		},
		dateFormat () {
			// Defaults to dddd DD. MMMM for: all grid schedules with more than two rooms, and all list schedules with less than five days
			// After that, we start to shorten the date string, hoping to reduce unwanted scroll behaviour
			if ((this.showGrid && this.schedule && this.schedule.rooms.length > 2) || !this.days || !this.days.length) return 'dddd DD. MMMM'
			if (this.days && this.days.length <= 5) return 'dddd DD. MMMM'
			if (this.days && this.days.length <= 7) return 'dddd DD. MMM'
			return 'ddd DD. MMM'
		},
		eventSlug () {
			let url = ''
			if (this.eventUrl.startsWith('http')) {
				url = new URL(this.eventUrl)
			} else {
				url = new URL('http://example.org/' + this.eventUrl)
			}
			return url.pathname.replace(/\//g, '')
		},
		sortBy () {
			return this.selectedSort
		}
	},
	async created () {
		moment.locale(this.locale)
		this.userTimezone = moment.tz.guess()
		let version = ''
		if (this.version)
			version = `v/${this.version}/`
		const url = `${this.eventUrl}schedule/${version}widgets/schedule.json`
		const legacyUrl = `${this.eventUrl}schedule/${version}widget/v2.json`
		// fetch from url, but fall back to legacyUrl if url fails
		try {
			this.schedule = await (await fetch(url)).json()
		} catch (e) {
			try {
				this.schedule = await (await fetch(legacyUrl)).json()
			} catch (e) {
				this.scheduleError = true
				return
			}
		}
		this.currentTimezone = localStorage.getItem(`${this.eventSlug}_timezone`)
		this.currentTimezone = [this.schedule.timezone, this.userTimezone].includes(this.currentTimezone) ? this.currentTimezone : this.schedule.timezone
		this.currentDay = this.days[0]
		this.now = moment().tz(this.currentTimezone)
		setInterval(() => this.now = moment().tz(this.currentTimezone), 30000)
		if (!this.scrollParentResizeObserver) {
			await this.$nextTick()
			this.onWindowResize()
		}
		let trackData = JSON.parse(JSON.stringify(this.schedule.tracks))
		trackData.map(t => { t.value = t.id; t.label = getLocalizedString(t.name); return t })
		this.filter.tracks.data = trackData
		let roomData = JSON.parse(JSON.stringify(this.schedule.rooms))
		roomData.map(t => { t.value = t.id; t.label = getLocalizedString(t.name); return t })
		this.filter.rooms.data = roomData

		const obj = {}
		this.schedule.talks.forEach(t => {
			if (t.session_type && !obj[t.session_type]) {
				obj[t.session_type] = true
				const item = {
					value: t.session_type,
					label: (t.session_type)
				}
				this.filter.types.data.push(item)
			}
		})

		this.favs = this.pruneFavs(await this.loadFavs(), this.schedule)
		const fragment = window.location.hash.slice(1)
		if (fragment && fragment.length === 10) {
			const initialDay = moment(fragment, 'YYYY-MM-DD')

			const filteredDays = this.days.filter(d => d.format('YYYYMMDD') === initialDay.format('YYYYMMDD'))
			if (filteredDays.length) {
				this.currentDay = filteredDays[0]
			}
		}
	},
	async mounted () {
		// We block until we have either a regular parent or a shadow DOM parent
		await new Promise((resolve) => {
			const poll = () => {
				if (this.$el.parentElement || this.$el.getRootNode().host) return resolve()
				setTimeout(poll, 100)
			}
			poll()
		})
		this.scrollParent = findScrollParent(this.$el.parentElement || this.$el.getRootNode().host)
		if (this.scrollParent) {
			this.scrollParentResizeObserver = new ResizeObserver(this.onScrollParentResize)
			this.scrollParentResizeObserver.observe(this.scrollParent)
			this.scrollParentWidth = this.scrollParent.offsetWidth
		} else { // scrolling document
			window.addEventListener('resize', this.onWindowResize)
			this.onWindowResize()
		}
	},
	destroyed () {
		// TODO destroy observers
	},
	methods: {
		changeDay (day) {
			if (day.isSame(this.currentDay)) return
			this.currentDay = moment(day, this.currentTimezone).startOf('day')
			window.location.hash = day.format('YYYY-MM-DD')
		},
		onWindowResize () {
			this.scrollParentWidth = document.body.offsetWidth
		},
		saveTimezone () {
			localStorage.setItem(`${this.eventSlug}_timezone`, this.currentTimezone)
		},
		onScrollParentResize (entries) {
			this.scrollParentWidth = entries[0].contentRect.width
		},
		async loadFavs () {
			const dataCached = localStorage.getItem(`${this.eventSlug}_favs`)
			let userData = []
			try {
				// Remove event slug to get correct talk domain
				const baseUrl = this.eventUrl.substring(0, this.eventUrl.lastIndexOf('/', this.eventUrl.length - 2) + 1);
				userData = await (await fetch(`${baseUrl}api/events/${this.eventSlug}/favourite-talk/`,
						{
							method: 'GET',
							headers: {
								'Content-Type': 'application/json'
							}
						})).json()
			} catch (e) {
				console.error('error happened when trying to load favourite talk')
			}
			let data
			if (userData.length !== 0) {
				data = JSON.stringify(userData)
			} else {
				data = dataCached
			}
			if (data) {
				try {
					return JSON.parse(data)
				} catch {
					localStorage.setItem(`${this.eventSlug}_favs`, '[]')
				}
			}
			return []
		},
		pruneFavs (favs, schedule) {
			const talks = schedule.talks || []
			const talkIds = talks.map(e => e.code)
			return favs.filter(e => talkIds.includes(e))
		},
		closeModal () {
			this.showModal = false
		},
		async saveFavs () {
			try {
				const response = await (await fetch(`/api/events/${this.eventSlug}/favourite-talk/`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(this.favs)
					}))
				if (response.status === 400) {
					const data = await response.json()
					if (data === 'user_not_logged_in') {
						this.showModal = true
						return
					}
				}
			} catch (e) {
				console.error(`error happened when trying to save favourite talk: ${JSON.stringify(this.favs)}`)
			}
			localStorage.setItem(`${this.eventSlug}_favs`, JSON.stringify(this.favs))
		},
		async fav (id) {
			if (!this.favs.includes(id)) {
				this.favs.push(id)
				await this.saveFavs()
			}
		},
		async unfav (id) {
			this.favs = this.favs.filter(elem => elem !== id)
			await this.saveFavs()
			if (!this.favs.length) this.onlyFavs = false
		},
		resetAllFiltered () {
			this.resetFiltered()
			this.onlyFavs = false
		},
		resetFiltered () {
			Object.keys(this.filter).forEach(key => {
				this.filter[key].data.forEach(t => {
					if (t.selected) {
						t.selected = false
					}
				})
			})
		},
		toggleSortOptions() {
			this.showSortOptions = !this.showSortOptions;
		},
		handleSortSelected() {
			this.selectedSort = this.selectedSortIcon;
		}
	}
}
</script>
<style lang="stylus">
@import 'styles/global.styl'
.schedule-error
	color: $clr-error
	font-size: 18px
	text-align: center
	padding: 32px
	.error-message
		margin-top: 16px
.pretalx-schedule
	display: flex
	flex-direction: column
	min-height: 0
	height: 100%
	font-size: 14px
	&.grid-schedule
		min-width: min-content
		max-width: var(--schedule-max-width)
		margin: 0 auto
	&.list-schedule
		min-width: 0
	.modal-overlay
		position: fixed
		z-index: 1000
		top: 0
		left: 0
		width: 100%
		height: 100%
		background-color: rgba(0,0,0,0.4)
		.modal-box
			width: 600px
			max-width: calc(95% - 64px)
			border-radius: 32px
			padding: 4px 32px
			margin-top: 32px
			background: white
			margin-left: auto
			margin-right: auto
			.checkbox-line
				margin: 16px 8px
				.bunt-checkbox.checked .bunt-checkbox-box
					background-color: var(--track-color)
					border-color: var(--track-color)
				.track-description
					color: $clr-grey-600
					margin-left: 32px
	.settings
		max-width: calc(var(--schedule-max-width) - 10px)
		position: sticky
		left: 0
		align-self: flex-start
		display: flex
		align-items: center
		z-index: 100
		width: 100%
		flex-wrap: wrap
		margin-left: 10px
		.fav-toggle
			display: flex
			margin-right: 5px
			&.active
				border: #FFA000 2px solid
			.bunt-button-text
				display: flex
				align-items: center
			svg
				width: 20px
				height: 20px
				margin-right: 6px
		.filter-tracks
			margin-right: 8px
			display: flex
			.bunt-button-text
				display: flex
				align-items: center
				padding-right: 8px
			svg
				width: 36px
				height: 36px
				margin-right: 6px
		.bunt-select
			max-width: 150px
			padding-right: 8px
			margin-left: 5px
		.timezone-label
			cursor: default
			color: $clr-secondary-text-light
		// .bunt-select, .timezone-label
		// 	margin-left: auto
	.days
		background-color: $clr-white
		tabs-style(active-color: var(--pretalx-clr-primary), indicator-color: var(--pretalx-clr-primary), background-color: transparent)
		overflow-x: auto
		position: sticky
		top: var(--pretalx-sticky-top-offset, 0px)
		left: 0
		margin-bottom: 0
		flex: none
		min-width: 0
		max-width: var(--schedule-max-width)
		height: 48px
		z-index: 30
		.bunt-tabs-header
			min-width: min-content
		.bunt-tabs-header-items
			justify-content: center
			min-width: min-content
			.bunt-tab-header-item
				min-width: min-content
			.bunt-tab-header-item-text
				white-space: nowrap
.modal {
	display: flex;
	justify-content: center;
	align-items: center;
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 999;
}

.modal-content {
	background-color: white;
	padding: 20px;
	border-radius: 5px;
	width: 300px;
	text-align: center;
	position: relative;
	border: 1px solid var(--pretalx-clr-primary);
}

.modal-header {
	margin-bottom: 10px;
}

.modal-title {
	margin: 0;
	font-size: 1.25em;
	color: var(--pretalx-clr-primary);
}

.modal-body {
	margin-bottom: 20px;
}

.modal-footer {
	display: flex;
	justify-content: flex-end;
	.button {
		cursor:pointer;
		border: 1px solid var(--pretalx-clr-primary)
		padding: 2px 5px;
		border-radius: 5px;
	}
}

.modal-footer button {
	background-color: transparent;
	border: 1px solid #ccc;
	border-radius: 5px;
	padding: 5px 10px;
	cursor: pointer;
}

.sort-icon {
	display: none !important
}

@media (max-width: 480px) {
	.hide-select {
		display: none
	}
    .sort-icon {
      display: flex !important;
      align-items: center;
	  padding: 0 !important;
	  min-width: 40px !important;
	  margin-right: 10px;
	  width: 40px !important;
    }

	.sort-icon .bunt-button-text {
		display: flex
		align-items: center
		width: 20px;
	}
	.sort-icon .bunt-button-text svg {
		width: 20px
		height: 20px
		position: absolute
	}
	.dropdown-sort-menu {
		background: white;
		border: 1px solid #ccc;
		border-radius: 4px;
		transform: translate(-7%, 68%);
		min-width: 150px !important;
	}

  }

</style>
