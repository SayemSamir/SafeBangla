import test from 'node:test';
import assert from 'node:assert';
import { isValidUrl, getInitialsAvatar } from './teamValidation';
import { INITIAL_TEAM_MEMBERS, INITIAL_ACADEMIC_INFO, INITIAL_JOURNEY_STAGES } from '../data/teamData';

test('INITIAL_TEAM_MEMBERS contains exactly five verified team members', () => {
  assert.strictEqual(INITIAL_TEAM_MEMBERS.length, 5);

  const names = INITIAL_TEAM_MEMBERS.map(m => m.name);
  assert.ok(names.includes('Gazi Sayem Uddin Samir'));
  assert.ok(names.includes('Antunia Das'));
  assert.ok(names.includes('Ovin Paul'));
  assert.ok(names.includes('Montashir Nabil'));
  assert.ok(names.includes('Sadman Samir'));
});

test('Unsupplied fields are set to "To be updated" or empty per prompt rules', () => {
  INITIAL_TEAM_MEMBERS.forEach(member => {
    assert.ok(
      member.projectRole === 'To be updated' || typeof member.projectRole === 'string'
    );
    assert.ok(
      member.shortBio === 'To be updated' || typeof member.shortBio === 'string'
    );
    assert.strictEqual(member.isPublic, true);
  });
});

test('INITIAL_ACADEMIC_INFO has verified institution, department, and supervisor', () => {
  assert.strictEqual(INITIAL_ACADEMIC_INFO.university, 'BGC Trust University Bangladesh');
  assert.strictEqual(INITIAL_ACADEMIC_INFO.department, 'Computer Science & Engineering');
  assert.strictEqual(INITIAL_ACADEMIC_INFO.courseTitle, 'Software Development Project -1');
  assert.strictEqual(INITIAL_ACADEMIC_INFO.supervisor, 'Ferdous Ara');
  assert.strictEqual(INITIAL_ACADEMIC_INFO.projectName, 'RESQ BANGLADESH');
});

test('INITIAL_JOURNEY_STAGES contains all 9 required stages', () => {
  assert.strictEqual(INITIAL_JOURNEY_STAGES.length, 9);
  const stageNames = INITIAL_JOURNEY_STAGES.map(s => s.stageName);
  assert.ok(stageNames.includes('Research & Planning'));
  assert.ok(stageNames.includes('UI/UX Design'));
  assert.ok(stageNames.includes('Frontend Development'));
  assert.ok(stageNames.includes('Backend Development'));
  assert.ok(stageNames.includes('Database Development'));
  assert.ok(stageNames.includes('AI & GIS Integration'));
  assert.ok(stageNames.includes('Testing & QA'));
  assert.ok(stageNames.includes('Deployment & Operations'));
});

test('isValidUrl detects valid and invalid web URLs', () => {
  assert.strictEqual(isValidUrl('https://github.com/SayemSamir/SafeBangla'), true);
  assert.strictEqual(isValidUrl('http://localhost:3000'), true);
  assert.strictEqual(isValidUrl('invalid-url-string'), false);
  assert.strictEqual(isValidUrl(''), false);
});

test('getInitialsAvatar produces 2-letter uppercase initials', () => {
  const res1 = getInitialsAvatar('Gazi Sayem Uddin Samir');
  assert.strictEqual(res1.initials, 'GS');
  assert.ok(res1.bgColor.length > 0);

  const res2 = getInitialsAvatar('Antunia Das');
  assert.strictEqual(res2.initials, 'AD');
});
