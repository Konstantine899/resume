# **PHASE 5: Admin Mode** 👨‍💻

**Длительность:** 3-4 часа
**Цель:** Режим редактирования контента портфолио

---

## Подплан 5.1: Admin Slice (30 мин)

### [ ] 5.1.1 Создание `src/features/admin/model/adminSlice.ts`

- `isAdminMode` state
- `isEditModalOpen` state
- `editingSection` state
- localStorage персистентность

### [ ] 5.1.2 Actions

- `toggleAdminMode`
- `setAdminMode`
- `openEditModal`, `closeEditModal`

---

## Подплан 5.2: Admin Toggle Button (30 мин)

### [ ] 5.2.1 Создание компонента

- `src/features/admin/ui/AdminToggleButton/AdminToggleButton.tsx`
- Интеграция в Sidebar

### [ ] 5.2.2 Визуальные состояния

- Active/inactive стили
- Tooltip с инструкцией

---

## Подплан 5.3: Edit Hero Modal (2 часа)

### [ ] 5.3.1 Создание модалки

- `src/features/admin/ui/EditHeroModal/EditHeroModal.tsx`
- Интеграция с Portal + Overlay

### [ ] 5.3.2 Форма редактирования

- `src/features/admin/ui/EditHeroModal/EditHeroForm.tsx`
- React Hook Form + Zod валидация
- Поля: fullName, profession, specialties, skillsLabel, yearsOfExperience, age

### [ ] 5.3.3 Интеграция с Redux

- Чтение текущих данных
- Отправка изменений
- Reset к исходным значениям

### [ ] 5.3.4 UX улучшения

- Loading state при сохранении
- Success/Error уведомления
- Закрытие по Escape/Overlay

---

## Подплан 5.4: Visual Indicators (30 мин)

### [ ] 5.4.1 Границы у секций

- CSS outline в admin mode
- Анимация появления

### [ ] 5.4.2 Edit кнопки на секциях

- Hero, MyWork, About, Skills, Contact
- Иконка Pencil

### [ ] 5.4.3 Admin Mode Indicator

- Бейдж в углу экрана
- Только в active режиме

---

## ✅ Acceptance Criteria Phase 5

- [ ] Admin toggle работает
- [ ] Состояние сохраняется в localStorage
- [ ] Edit модалка открывается/закрывается
- [ ] Данные редактируются и сохраняются
- [ ] Визуальные индикаторы работают
- [ ] Валидация формы работает

---

## 📝 Checklist

```
[ ] 5.1.1 Create adminSlice
[ ] 5.1.2 Create actions
[ ] 5.2.1 Create AdminToggleButton
[ ] 5.2.2 Add visual states
[ ] 5.3.1 Create EditHeroModal
[ ] 5.3.2 Create EditHeroForm
[ ] 5.3.3 Integrate with Redux
[ ] 5.3.4 UX improvements
[ ] 5.4.1 Section borders in admin mode
[ ] 5.4.2 Edit buttons on sections
[ ] 5.4.3 Admin Mode Indicator
```

**Всего:** 11 задач
