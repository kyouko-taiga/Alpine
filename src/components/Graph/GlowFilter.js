import React from 'react'

const GlowFilter = () => (
  <filter id="alpine-glow-filter" height="150%" width="150%" x="-25%" y="-25%">
		<feMorphology operator="dilate" radius="2" in="SourceAlpha" result="thicken" />
		<feGaussianBlur in="thicken" stdDeviation="2.5" result="blurred" />
		<feFlood floodColor="rgb(61, 145, 254)" result="glowColor" />
		<feComposite in="glowColor" in2="blurred" operator="in" result="softGlow_colored" />
		<feMerge>
			<feMergeNode in="softGlow_colored"/>
			<feMergeNode in="SourceGraphic"/>
		</feMerge>
	</filter>
)

export default GlowFilter
