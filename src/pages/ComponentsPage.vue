<script setup lang="ts">
import { ref, computed } from 'vue';
import { Button, Input, Select, Dropdown } from '@/components/ui';
import {
  typographyTokens,
  colorTokens,
  spacingTokens,
  borderRadiusTokens,
} from '@/constants/designTokens';

// Playground states
const playgroundButton = ref({
  variant: 'primary' as 'primary' | 'secondary' | 'ghost' | 'danger',
  size: 'md' as 'sm' | 'md' | 'lg',
  disabled: false,
  text: 'Click Me',
});

const playgroundInput = ref({
  value: '',
  placeholder: 'Enter text...',
  disabled: false,
});

const playgroundSelect = ref({
  value: 'option1',
  size: 'md' as 'sm' | 'md' | 'lg',
  placeholder: 'Select an option',
});

const playgroundDropdown = ref({
  trigger: 'click' as 'click' | 'hover',
  buttonText: 'Open Menu',
});

// Select options
const selectOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
];

const dropdownOptions = [
  { label: 'Edit', key: 'edit' },
  { label: 'Delete', key: 'delete' },
  { type: 'divider' as const, key: 'd1' },
  { label: 'Settings', key: 'settings' },
];

const lastSelectedAction = ref<string>('');

const handleDropdownSelect = (key: string) => {
  lastSelectedAction.value = key;
};

// Code snippets
const buttonCode = computed(() => {
  const props = [
    playgroundButton.value.variant !== 'primary' ? `variant="${playgroundButton.value.variant}"` : '',
    playgroundButton.value.size !== 'md' ? `size="${playgroundButton.value.size}"` : '',
    playgroundButton.value.disabled ? 'disabled' : '',
  ].filter(Boolean).join(' ');

  return `<Button ${props}>${playgroundButton.value.text}</Button>`;
});

const inputCode = computed(() => {
  const props = [
    'v-model="value"',
    playgroundInput.value.placeholder ? `placeholder="${playgroundInput.value.placeholder}"` : '',
    playgroundInput.value.disabled ? 'disabled' : '',
  ].filter(Boolean).join(' ');

  return `<Input ${props} />`;
});

const selectCode = computed(() => {
  const props = [
    'v-model="selectedValue"',
    ':options="options"',
    playgroundSelect.value.size !== 'md' ? `size="${playgroundSelect.value.size}"` : '',
    playgroundSelect.value.placeholder ? `placeholder="${playgroundSelect.value.placeholder}"` : '',
  ].filter(Boolean).join(' ');

  return `<Select ${props} />`;
});

const dropdownCode = computed(() => {
  const props = [
    playgroundDropdown.value.trigger !== 'click' ? `trigger="${playgroundDropdown.value.trigger}"` : '',
    ':options="options"',
    '@select="handleSelect"',
  ].filter(Boolean).join(' ');

  return `<Dropdown ${props}>\n  <Button>${playgroundDropdown.value.buttonText}</Button>\n</Dropdown>`;
});

// Copy to clipboard
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-6">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <header class="mb-12">
        <h1 class="text-4xl font-bold text-slate-900 mb-3">Component Library</h1>
        <p class="text-slate-600 text-lg">
          Swagger-style interactive documentation and testing environment
        </p>
      </header>

      <div class="space-y-12">
        <!-- API Reference -->
        <section class="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">Component API Reference</h2>

          <div class="space-y-8">
            <!-- Select vs Dropdown -->
            <div class="border-l-4 border-indigo-500 pl-6 py-4 bg-indigo-50/50 rounded-r-lg">
              <h3 class="text-lg font-bold text-slate-900 mb-3">Select vs Dropdown</h3>

              <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-3">
                  <h4 class="font-semibold text-indigo-900 flex items-center gap-2">
                    <span class="w-2 h-2 bg-indigo-500 rounded-full"></span>
                    Select Component
                  </h4>
                  <ul class="space-y-2 text-sm text-slate-700">
                    <li><strong>Purpose:</strong> Form input element for selecting a single value</li>
                    <li><strong>Data Binding:</strong> v-model (two-way binding)</li>
                    <li><strong>Usage:</strong> Forms, filters, settings</li>
                    <li><strong>Behavior:</strong> Stores selected value in state</li>
                    <li><strong>Return:</strong> Selected value (string)</li>
                  </ul>
                  <div class="bg-white p-3 rounded-lg border border-indigo-200 mt-3">
                    <code class="text-xs text-slate-800 font-mono">
                      &lt;Select v-model="value" :options="opts" /&gt;
                    </code>
                  </div>
                </div>

                <div class="space-y-3">
                  <h4 class="font-semibold text-purple-900 flex items-center gap-2">
                    <span class="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Dropdown Component
                  </h4>
                  <ul class="space-y-2 text-sm text-slate-700">
                    <li><strong>Purpose:</strong> Action menu triggered by button/element</li>
                    <li><strong>Data Binding:</strong> @select event emitter</li>
                    <li><strong>Usage:</strong> Context menus, action lists, navigation</li>
                    <li><strong>Behavior:</strong> Triggers action on item click</li>
                    <li><strong>Return:</strong> Selected item key (string)</li>
                  </ul>
                  <div class="bg-white p-3 rounded-lg border border-purple-200 mt-3">
                    <code class="text-xs text-slate-800 font-mono">
                      &lt;Dropdown :options="opts" @select="fn"&gt;<br/>
                      &nbsp;&nbsp;&lt;Button&gt;Trigger&lt;/Button&gt;<br/>
                      &lt;/Dropdown&gt;
                    </code>
                  </div>
                </div>
              </div>

              <div class="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p class="text-sm text-amber-900">
                  <strong>Key Difference:</strong> Select manages form state (v-model), Dropdown triggers actions (events).
                  Use Select for data input, Dropdown for command execution.
                </p>
              </div>
            </div>

            <!-- Button Props -->
            <div>
              <h3 class="text-lg font-semibold text-slate-900 mb-4">Button Props</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th class="text-left p-3 font-semibold text-slate-700">Prop</th>
                      <th class="text-left p-3 font-semibold text-slate-700">Type</th>
                      <th class="text-left p-3 font-semibold text-slate-700">Default</th>
                      <th class="text-left p-3 font-semibold text-slate-700">Description</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr class="hover:bg-slate-50">
                      <td class="p-3 font-mono text-indigo-600">variant</td>
                      <td class="p-3 font-mono text-slate-600">'primary' | 'secondary' | 'ghost' | 'danger'</td>
                      <td class="p-3 font-mono text-slate-500">'primary'</td>
                      <td class="p-3 text-slate-700">Visual style variant</td>
                    </tr>
                    <tr class="hover:bg-slate-50">
                      <td class="p-3 font-mono text-indigo-600">size</td>
                      <td class="p-3 font-mono text-slate-600">'sm' | 'md' | 'lg'</td>
                      <td class="p-3 font-mono text-slate-500">'md'</td>
                      <td class="p-3 text-slate-700">Button size</td>
                    </tr>
                    <tr class="hover:bg-slate-50">
                      <td class="p-3 font-mono text-indigo-600">disabled</td>
                      <td class="p-3 font-mono text-slate-600">boolean</td>
                      <td class="p-3 font-mono text-slate-500">false</td>
                      <td class="p-3 text-slate-700">Disable button interactions</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Input Props -->
            <div>
              <h3 class="text-lg font-semibold text-slate-900 mb-4">Input Props</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th class="text-left p-3 font-semibold text-slate-700">Prop</th>
                      <th class="text-left p-3 font-semibold text-slate-700">Type</th>
                      <th class="text-left p-3 font-semibold text-slate-700">Default</th>
                      <th class="text-left p-3 font-semibold text-slate-700">Description</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr class="hover:bg-slate-50">
                      <td class="p-3 font-mono text-indigo-600">modelValue</td>
                      <td class="p-3 font-mono text-slate-600">string</td>
                      <td class="p-3 font-mono text-slate-500">''</td>
                      <td class="p-3 text-slate-700">Input value (v-model)</td>
                    </tr>
                    <tr class="hover:bg-slate-50">
                      <td class="p-3 font-mono text-indigo-600">placeholder</td>
                      <td class="p-3 font-mono text-slate-600">string</td>
                      <td class="p-3 font-mono text-slate-500">''</td>
                      <td class="p-3 text-slate-700">Placeholder text</td>
                    </tr>
                    <tr class="hover:bg-slate-50">
                      <td class="p-3 font-mono text-indigo-600">disabled</td>
                      <td class="p-3 font-mono text-slate-600">boolean</td>
                      <td class="p-3 font-mono text-slate-500">false</td>
                      <td class="p-3 text-slate-700">Disable input</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Select Props -->
            <div>
              <h3 class="text-lg font-semibold text-slate-900 mb-4">Select Props</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th class="text-left p-3 font-semibold text-slate-700">Prop</th>
                      <th class="text-left p-3 font-semibold text-slate-700">Type</th>
                      <th class="text-left p-3 font-semibold text-slate-700">Default</th>
                      <th class="text-left p-3 font-semibold text-slate-700">Description</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr class="hover:bg-slate-50">
                      <td class="p-3 font-mono text-indigo-600">modelValue</td>
                      <td class="p-3 font-mono text-slate-600">string</td>
                      <td class="p-3 font-mono text-slate-500">required</td>
                      <td class="p-3 text-slate-700">Selected value (v-model)</td>
                    </tr>
                    <tr class="hover:bg-slate-50">
                      <td class="p-3 font-mono text-indigo-600">options</td>
                      <td class="p-3 font-mono text-slate-600">Array&lt;{label, value}&gt;</td>
                      <td class="p-3 font-mono text-slate-500">required</td>
                      <td class="p-3 text-slate-700">Select options</td>
                    </tr>
                    <tr class="hover:bg-slate-50">
                      <td class="p-3 font-mono text-indigo-600">size</td>
                      <td class="p-3 font-mono text-slate-600">'sm' | 'md' | 'lg'</td>
                      <td class="p-3 font-mono text-slate-500">'md'</td>
                      <td class="p-3 text-slate-700">Select size</td>
                    </tr>
                    <tr class="hover:bg-slate-50">
                      <td class="p-3 font-mono text-indigo-600">placeholder</td>
                      <td class="p-3 font-mono text-slate-600">string</td>
                      <td class="p-3 font-mono text-slate-500">'선택하세요'</td>
                      <td class="p-3 text-slate-700">Placeholder text</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Dropdown Props -->
            <div>
              <h3 class="text-lg font-semibold text-slate-900 mb-4">Dropdown Props</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-slate-50 border-b-2 border-slate-200">
                    <tr>
                      <th class="text-left p-3 font-semibold text-slate-700">Prop</th>
                      <th class="text-left p-3 font-semibold text-slate-700">Type</th>
                      <th class="text-left p-3 font-semibold text-slate-700">Default</th>
                      <th class="text-left p-3 font-semibold text-slate-700">Description</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr class="hover:bg-slate-50">
                      <td class="p-3 font-mono text-indigo-600">options</td>
                      <td class="p-3 font-mono text-slate-600">Array&lt;{label?, key, type?}&gt;</td>
                      <td class="p-3 font-mono text-slate-500">required</td>
                      <td class="p-3 text-slate-700">Menu options (type: 'divider' for separator)</td>
                    </tr>
                    <tr class="hover:bg-slate-50">
                      <td class="p-3 font-mono text-indigo-600">trigger</td>
                      <td class="p-3 font-mono text-slate-600">'click' | 'hover'</td>
                      <td class="p-3 font-mono text-slate-500">'click'</td>
                      <td class="p-3 text-slate-700">Trigger type</td>
                    </tr>
                    <tr class="hover:bg-slate-50">
                      <td class="p-3 font-mono text-indigo-600">@select</td>
                      <td class="p-3 font-mono text-slate-600">(key: string) => void</td>
                      <td class="p-3 font-mono text-slate-500">-</td>
                      <td class="p-3 text-slate-700">Event emitted on item select</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <!-- Interactive Playground -->
        <section class="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">Interactive Playground</h2>
          <p class="text-slate-600 mb-8">Test components with live props control and generated code snippets</p>

          <div class="space-y-10">
            <!-- Button Playground -->
            <div class="border border-slate-200 rounded-xl overflow-hidden">
              <div class="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 class="text-lg font-semibold text-slate-900">Button Component</h3>
              </div>

              <div class="grid md:grid-cols-2 gap-6 p-6">
                <!-- Controls -->
                <div class="space-y-4">
                  <h4 class="font-medium text-slate-700 mb-4">Controls</h4>

                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-2">Variant</label>
                    <Select
                      v-model="playgroundButton.variant"
                      :options="[
                        { label: 'Primary', value: 'primary' },
                        { label: 'Secondary', value: 'secondary' },
                        { label: 'Ghost', value: 'ghost' },
                        { label: 'Danger', value: 'danger' },
                      ]"
                      size="sm"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-2">Size</label>
                    <Select
                      v-model="playgroundButton.size"
                      :options="[
                        { label: 'Small', value: 'sm' },
                        { label: 'Medium', value: 'md' },
                        { label: 'Large', value: 'lg' },
                      ]"
                      size="sm"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-2">Button Text</label>
                    <Input v-model="playgroundButton.text" placeholder="Button text" />
                  </div>

                  <div class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      v-model="playgroundButton.disabled"
                      class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <label class="text-sm font-medium text-slate-600">Disabled</label>
                  </div>
                </div>

                <!-- Preview & Code -->
                <div class="space-y-4">
                  <div>
                    <h4 class="font-medium text-slate-700 mb-4">Preview</h4>
                    <div class="p-8 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
                      <Button
                        :variant="playgroundButton.variant"
                        :size="playgroundButton.size"
                        :disabled="playgroundButton.disabled"
                      >
                        {{ playgroundButton.text }}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="font-medium text-slate-700">Generated Code</h4>
                      <button
                        @click="copyToClipboard(buttonCode)"
                        class="px-3 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <pre class="p-4 bg-slate-900 text-slate-100 rounded-lg text-sm overflow-x-auto"><code>{{ buttonCode }}</code></pre>
                  </div>
                </div>
              </div>
            </div>

            <!-- Input Playground -->
            <div class="border border-slate-200 rounded-xl overflow-hidden">
              <div class="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 class="text-lg font-semibold text-slate-900">Input Component</h3>
              </div>

              <div class="grid md:grid-cols-2 gap-6 p-6">
                <!-- Controls -->
                <div class="space-y-4">
                  <h4 class="font-medium text-slate-700 mb-4">Controls</h4>

                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-2">Placeholder</label>
                    <Input v-model="playgroundInput.placeholder" placeholder="Placeholder text" />
                  </div>

                  <div class="flex items-center gap-2">
                    <input
                      type="checkbox"
                      v-model="playgroundInput.disabled"
                      class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <label class="text-sm font-medium text-slate-600">Disabled</label>
                  </div>

                  <div>
                    <p class="text-sm text-slate-600 mb-1">Current Value:</p>
                    <p class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-800">
                      {{ playgroundInput.value || '(empty)' }}
                    </p>
                  </div>
                </div>

                <!-- Preview & Code -->
                <div class="space-y-4">
                  <div>
                    <h4 class="font-medium text-slate-700 mb-4">Preview</h4>
                    <div class="p-8 bg-slate-50 rounded-lg border border-slate-200">
                      <Input
                        v-model="playgroundInput.value"
                        :placeholder="playgroundInput.placeholder"
                        :disabled="playgroundInput.disabled"
                      />
                    </div>
                  </div>

                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="font-medium text-slate-700">Generated Code</h4>
                      <button
                        @click="copyToClipboard(inputCode)"
                        class="px-3 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <pre class="p-4 bg-slate-900 text-slate-100 rounded-lg text-sm overflow-x-auto"><code>{{ inputCode }}</code></pre>
                  </div>
                </div>
              </div>
            </div>

            <!-- Select Playground -->
            <div class="border border-slate-200 rounded-xl overflow-hidden">
              <div class="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 class="text-lg font-semibold text-slate-900">Select Component</h3>
              </div>

              <div class="grid md:grid-cols-2 gap-6 p-6">
                <!-- Controls -->
                <div class="space-y-4">
                  <h4 class="font-medium text-slate-700 mb-4">Controls</h4>

                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-2">Size</label>
                    <Select
                      v-model="playgroundSelect.size"
                      :options="[
                        { label: 'Small', value: 'sm' },
                        { label: 'Medium', value: 'md' },
                        { label: 'Large', value: 'lg' },
                      ]"
                      size="sm"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-2">Placeholder</label>
                    <Input v-model="playgroundSelect.placeholder" placeholder="Placeholder text" />
                  </div>

                  <div>
                    <p class="text-sm text-slate-600 mb-1">Selected Value:</p>
                    <p class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-800">
                      {{ playgroundSelect.value }}
                    </p>
                  </div>
                </div>

                <!-- Preview & Code -->
                <div class="space-y-4">
                  <div>
                    <h4 class="font-medium text-slate-700 mb-4">Preview</h4>
                    <div class="p-8 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
                      <Select
                        v-model="playgroundSelect.value"
                        :options="selectOptions"
                        :size="playgroundSelect.size"
                        :placeholder="playgroundSelect.placeholder"
                      />
                    </div>
                  </div>

                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="font-medium text-slate-700">Generated Code</h4>
                      <button
                        @click="copyToClipboard(selectCode)"
                        class="px-3 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <pre class="p-4 bg-slate-900 text-slate-100 rounded-lg text-sm overflow-x-auto"><code>{{ selectCode }}</code></pre>
                  </div>
                </div>
              </div>
            </div>

            <!-- Dropdown Playground -->
            <div class="border border-slate-200 rounded-xl overflow-hidden">
              <div class="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 class="text-lg font-semibold text-slate-900">Dropdown Component</h3>
              </div>

              <div class="grid md:grid-cols-2 gap-6 p-6">
                <!-- Controls -->
                <div class="space-y-4">
                  <h4 class="font-medium text-slate-700 mb-4">Controls</h4>

                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-2">Trigger Type</label>
                    <Select
                      v-model="playgroundDropdown.trigger"
                      :options="[
                        { label: 'Click', value: 'click' },
                        { label: 'Hover', value: 'hover' },
                      ]"
                      size="sm"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-600 mb-2">Button Text</label>
                    <Input v-model="playgroundDropdown.buttonText" placeholder="Button text" />
                  </div>

                  <div>
                    <p class="text-sm text-slate-600 mb-1">Last Selected Action:</p>
                    <p class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-800">
                      {{ lastSelectedAction || '(none)' }}
                    </p>
                  </div>
                </div>

                <!-- Preview & Code -->
                <div class="space-y-4">
                  <div>
                    <h4 class="font-medium text-slate-700 mb-4">Preview</h4>
                    <div class="p-8 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center">
                      <Dropdown
                        :trigger="playgroundDropdown.trigger"
                        :options="dropdownOptions"
                        @select="handleDropdownSelect"
                      >
                        <Button variant="secondary">{{ playgroundDropdown.buttonText }}</Button>
                      </Dropdown>
                    </div>
                  </div>

                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <h4 class="font-medium text-slate-700">Generated Code</h4>
                      <button
                        @click="copyToClipboard(dropdownCode)"
                        class="px-3 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                    <pre class="p-4 bg-slate-900 text-slate-100 rounded-lg text-sm overflow-x-auto"><code>{{ dropdownCode }}</code></pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Design System -->
        <section class="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <h2 class="text-2xl font-bold text-slate-900 mb-6">Design System</h2>
          <p class="text-slate-600 mb-8">Visual design tokens with actual sizes and colors</p>

          <div class="space-y-10">
            <!-- Typography -->
            <div>
              <h3 class="text-lg font-semibold text-slate-900 mb-6">Typography</h3>

              <div class="space-y-6">
                <div
                  v-for="token in typographyTokens"
                  :key="token.class"
                  class="flex items-center gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div class="min-w-32">
                    <code class="text-sm font-mono text-indigo-600">{{ token.class }}</code>
                    <p class="text-xs text-slate-500 mt-1">{{ token.size }}</p>
                  </div>
                  <p :class="token.class" class="text-slate-900">{{ token.example }}</p>
                </div>
              </div>
            </div>

            <!-- Colors -->
            <div>
              <h3 class="text-lg font-semibold text-slate-900 mb-6">Colors</h3>

              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div v-for="token in colorTokens" :key="token.class" class="space-y-2">
                  <div
                    :class="[
                      `bg-${token.class}`,
                      'h-24 rounded-lg shadow-md flex items-center justify-center',
                      token.textColor === 'dark' ? 'border border-slate-300' : '',
                    ]"
                  >
                    <span :class="token.textColor === 'white' ? 'text-white' : 'text-slate-700'" class="font-mono text-sm">
                      {{ token.hex }}
                    </span>
                  </div>
                  <p class="text-sm font-mono text-slate-700">{{ token.class }}</p>
                  <p class="text-xs text-slate-500">{{ token.usage }}</p>
                </div>
              </div>
            </div>

            <!-- Spacing -->
            <div>
              <h3 class="text-lg font-semibold text-slate-900 mb-6">Spacing</h3>

              <div class="space-y-6">
                <div
                  v-for="token in spacingTokens"
                  :key="token.class"
                  class="flex items-center gap-6 p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div class="min-w-32">
                    <code class="text-sm font-mono text-indigo-600">{{ token.class }}</code>
                    <p class="text-xs text-slate-500 mt-1">{{ token.size }}</p>
                  </div>
                  <div :class="`flex ${token.class}`">
                    <div class="w-12 h-12 bg-indigo-500 rounded"></div>
                    <div class="w-12 h-12 bg-indigo-500 rounded"></div>
                  </div>
                  <p class="text-sm text-slate-600">{{ token.description }}</p>
                </div>
              </div>
            </div>

            <!-- Border Radius -->
            <div>
              <h3 class="text-lg font-semibold text-slate-900 mb-6">Border Radius</h3>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div v-for="token in borderRadiusTokens" :key="token.class" class="space-y-3">
                  <div :class="`h-20 bg-indigo-100 ${token.class} border-2 border-indigo-500`"></div>
                  <code class="text-sm font-mono text-indigo-600">{{ token.class }}</code>
                  <p class="text-xs text-slate-500">{{ token.size }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Footer -->
      <footer class="mt-12 text-center text-slate-600 text-sm">
        <p>Interactive component documentation and testing environment</p>
      </footer>
    </div>
  </div>
</template>
