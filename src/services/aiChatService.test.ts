import test from 'node:test';
import assert from 'node:assert/strict';
import { sendChatMessage, ChatMessage } from './aiChatService';

test('sendChatMessage produces intelligent response for cyclone signals in Bengali and English', async () => {
  const history: ChatMessage[] = [];
  const resultEn = await sendChatMessage(history, 'What are the cyclone signals in Bangladesh?', 'chatgpt', 'en');
  assert.ok(resultEn.text.length > 50, 'Response should contain detailed information');
  assert.ok(resultEn.text.toLowerCase().includes('cyclone') || resultEn.text.includes('সংকেত') || resultEn.text.toLowerCase().includes('signal'));

  const resultBn = await sendChatMessage(history, 'ঘূর্ণিঝড় ৮ নম্বর সংকেত দিলে কী করব?', 'deepseek', 'bn');
  assert.ok(resultBn.text.length > 50);
  assert.ok(resultBn.text.includes('ঘূর্ণিঝড়') || resultBn.text.includes('শেল্টার') || resultBn.text.includes('সংকেত'));
});

test('sendChatMessage supports coding questions like ChatGPT and DeepSeek', async () => {
  const history: ChatMessage[] = [];
  const result = await sendChatMessage(history, 'Write a python code for geospatial distance', 'deepseek', 'en');
  assert.ok(result.text.includes('```'), 'Should provide formatted code block');
  assert.ok(result.reasoning || result.source, 'Should include reasoning or source');
});

test('sendChatMessage answers medical and water purification questions', async () => {
  const history: ChatMessage[] = [];
  const result = await sendChatMessage(history, 'How to purify flood water without electricity?', 'emergency', 'en');
  assert.ok(result.text.toLowerCase().includes('water') || result.text.toLowerCase().includes('boil') || result.text.includes('পানি'));
});
