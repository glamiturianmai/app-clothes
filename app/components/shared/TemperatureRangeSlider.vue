<template>
  <div class="temperature-slider">
    <div class="temperature-slider__values">
      <span>{{ t('temperature.from', { value: signed(valueModel.min) }) }}</span>
      <span>{{ t('temperature.to', { value: signed(valueModel.max) }) }}</span>
    </div>
    <div
      class="temperature-slider__track-wrap"
      :style="{
        '--range-start': `${rangeStartPercent}%`,
        '--range-end': `${rangeEndPercent}%`,
      }"
    >
      <input
        v-model.number="minValue"
        class="temperature-slider__range temperature-slider__range_min"
        type="range"
        :min="minLimit"
        :max="maxLimit"
        step="1"
      />
      <input
        v-model.number="maxValue"
        class="temperature-slider__range temperature-slider__range_max"
        type="range"
        :min="minLimit"
        :max="maxLimit"
        step="1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  minLimit?: number
  maxLimit?: number
}>(), {
  minLimit: -20,
  maxLimit: 20,
})

const valueModel = defineModel<{ min: number; max: number }>({
  required: true,
})
const { t } = useAppI18n()

const minValue = computed({
  get: () => valueModel.value.min,
  set: (next) => {
    const bounded = Math.max(props.minLimit, Math.min(props.maxLimit, Math.round(next)))
    valueModel.value = {
      min: Math.min(bounded, valueModel.value.max),
      max: valueModel.value.max,
    }
  },
})

const maxValue = computed({
  get: () => valueModel.value.max,
  set: (next) => {
    const bounded = Math.max(props.minLimit, Math.min(props.maxLimit, Math.round(next)))
    valueModel.value = {
      min: valueModel.value.min,
      max: Math.max(bounded, valueModel.value.min),
    }
  },
})

const rangeStartPercent = computed(() => {
  const total = props.maxLimit - props.minLimit
  if (total <= 0) {
    return 0
  }
  return ((valueModel.value.min - props.minLimit) / total) * 100
})

const rangeEndPercent = computed(() => {
  const total = props.maxLimit - props.minLimit
  if (total <= 0) {
    return 100
  }
  return ((valueModel.value.max - props.minLimit) / total) * 100
})

function signed(value: number) {
  return value > 0 ? `+${value}` : String(value)
}
</script>

<style scoped lang="scss">
.temperature-slider {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.temperature-slider__values {
  display: flex;
  justify-content: space-between;
  font-size: 0.76rem;
  color: #5b5b59;
}

.temperature-slider__track-wrap {
  position: relative;
  height: 1.4rem;
}

.temperature-slider__track-wrap::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 0.28rem;
  transform: translateY(-50%);
  border-radius: 999px;
  background:
    linear-gradient(
      to right,
      #dadad7 0 var(--range-start),
      var(--ui-accent) var(--range-start) var(--range-end),
      #dadad7 var(--range-end) 100%
    );
}

.temperature-slider__range {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  margin: 0;
  height: 1.4rem;
  appearance: none;
  background: transparent;
  pointer-events: none;
}

.temperature-slider__range::-webkit-slider-thumb {
  appearance: none;
  pointer-events: auto;
  width: 0.82rem;
  height: 0.82rem;
  border-radius: 50%;
  border: 1px solid var(--ui-accent);
  background: #fff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.2);
  cursor: pointer;
}

.temperature-slider__range::-moz-range-thumb {
  pointer-events: auto;
  width: 0.82rem;
  height: 0.82rem;
  border-radius: 50%;
  border: 1px solid var(--ui-accent);
  background: #fff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.2);
  cursor: pointer;
}

.temperature-slider__range::-webkit-slider-runnable-track {
  background: transparent;
  border: 0;
}

.temperature-slider__range::-moz-range-track {
  background: transparent;
  border: 0;
}
</style>
