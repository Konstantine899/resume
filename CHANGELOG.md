# 1.0.0 (2026-08-25)

### Bug Fixes

- 4R review fixes for Link improvements ([491fa09](https://github.com/Konstantine899/resume/commit/491fa09665d7fffecfe200881321fa04f04ef3b0))
- **agents:** починить git-commit субагент — automation-first, убрать интерактивный workflow ([0e4d675](https://github.com/Konstantine899/resume/commit/0e4d6758196885334cc116f01672f90c2a1005a0))
- **agents:** унифицированы все модели агентов на qwen3.5:397b-cloud ([d8420e1](https://github.com/Konstantine899/resume/commit/d8420e1a754591e48941d2fba1b65f49bde16320)), closes [#26](https://github.com/Konstantine899/resume/issues/26)
- allow 'merge' commit type in commit-msg hook ([545e866](https://github.com/Konstantine899/resume/commit/545e86630fa8877f2ef7e1404bf37952f91f660b))
- **AnimatedSection:** исправить TypeScript ошибки в тестах ([11addf0](https://github.com/Konstantine899/resume/commit/11addf0a34cf1fcb0b1e6541dd65fdc7de49a72b))
- **AvatarAbout:** box-sizing border-box на inner — padding работает корректно ([b998c21](https://github.com/Konstantine899/resume/commit/b998c21e6fe23570f14cd9c23cf63373dd771be5))
- **AvatarAbout:** overflow:hidden + border-radius:50% на inner — как в AvatarHero ([a0d7027](https://github.com/Konstantine899/resume/commit/a0d7027028421250a3a9a51e32598f9c8007092e))
- **AvatarAbout:** padding внутри размеров как в AvatarHero ([f65ede2](https://github.com/Konstantine899/resume/commit/f65ede200e5bbabb90dcb26eb6f51d36913caa19))
- **AvatarAbout:** padding как в AvatarHero — 2/4/6px ([6b4a772](https://github.com/Konstantine899/resume/commit/6b4a77235f6e8f7fd3fb4b9890723e4945085c3f))
- **AvatarAbout:** padding на селекторе размера — circle не схлопывается ([9cfd9d5](https://github.com/Konstantine899/resume/commit/9cfd9d53c458169f781f6111c64c371b1e1c7ced))
- **AvatarAbout:** класс размера на avatarCircle — padding применяется ([8d6bbe3](https://github.com/Konstantine899/resume/commit/8d6bbe3a05e1cba2187fdb4331d8afa52c3369ba))
- **AvatarAbout:** отмена лишнего класса размера на circle ([4f53c54](https://github.com/Konstantine899/resume/commit/4f53c545d04f0c606c914d6ad00012a56a46db9f))
- **AvatarAbout:** пропорциональный padding avatar-circle — skeleton центрирован ([3afe083](https://github.com/Konstantine899/resume/commit/3afe083bce886518e402424203e08ba7a29c50a8))
- **avatar:** добавлен fillContainer пропс для AvatarFallback ([0820c5a](https://github.com/Konstantine899/resume/commit/0820c5a4213d0dd8c08d8dfc412a6ac59d8687d9)), closes [#f4b377](https://github.com/Konstantine899/resume/issues/f4b377)
- **Avatar:** исправить SCSS deprecation warning для Dart Sass 2.0.0 ([46f15ff](https://github.com/Konstantine899/resume/commit/46f15ff357b9193a9edce3faa8e8eb006107d100))
- **Avatar:** исправить импорт SCSS responsive миксинов ([a6611de](https://github.com/Konstantine899/resume/commit/a6611de6d70e1fbb45bca8fad6950883d9083496))
- **Avatar:** исправить пути импорта SCSS миксинов ([a3bae20](https://github.com/Konstantine899/resume/commit/a3bae2094f34ebb623ce938bdbc9664a732c3dd4))
- **build:** remove --skipLibCheck false override that broke type-check:strict ([d874945](https://github.com/Konstantine899/resume/commit/d874945d564c102c4b45150de5260a9df6ba5945))
- **build:** resolve cross-platform path issues in Vite config ([d27b986](https://github.com/Konstantine899/resume/commit/d27b9866c8d4180f1d4f8bb3809681c7cdbc0c79))
- **Button:** исправлены баги в Storybook + рефакторинг inferIconSize ([c60ed5a](https://github.com/Konstantine899/resume/commit/c60ed5a857dbdf20d13f8f5f048b8b453e45173f))
- **Button:** обновить использование Button в проекте ([5522939](https://github.com/Konstantine899/resume/commit/55229398fd78d587904b3f3d0ffbee29a9e84893))
- **Button:** улучшить архитектуру и добавить тесты ([0cb0771](https://github.com/Konstantine899/resume/commit/0cb0771cd24bd49601730af942babbd994c11c00))
- **Card:** dark theme text color in stories + base styles ([09d0a75](https://github.com/Konstantine899/resume/commit/09d0a751a4dcfd235eec1c2e67933f65577024f3))
- **ci:** inject GITHUB_TOKEN into release push ([#22](https://github.com/Konstantine899/resume/issues/22)) ([0df628a](https://github.com/Konstantine899/resume/commit/0df628a9e9d3669882ebb7323c52266d1dc8857a)), closes [#21](https://github.com/Konstantine899/resume/issues/21)
- **ci:** load FSD eslint plugin as CJS to stop lint crash ([#10](https://github.com/Konstantine899/resume/issues/10)) ([159e253](https://github.com/Konstantine899/resume/commit/159e253dd52929bbf8007fbbf0532733d6a29dad))
- **config:** restore valid Obsidian vault path in filesystem MCP args ([bcf4d22](https://github.com/Konstantine899/resume/commit/bcf4d220da74dc6a82c6edb5cd1b46ec38101c7f))
- **config:** review findings — storybook any, ecmaVersion, lint:storybook strict ([927ebdf](https://github.com/Konstantine899/resume/commit/927ebdfab3d35e1014bfa72826d19e31725f3fc9))
- **container:** добавить forwardRef и accessibility props ([4a20059](https://github.com/Konstantine899/resume/commit/4a2005918d5d7036fed6fa97ad781f6a5e4dc0bc))
- **divider:** исправить Storybook args и dashed/dotted паттерны ([68609fc](https://github.com/Konstantine899/resume/commit/68609fc313d828b50bdf38e5c5444827e900bd5e)), closes [#e0e0e0](https://github.com/Konstantine899/resume/issues/e0e0e0)
- **entities:** исправить циклические импорты и обновить данные проектов ([331c502](https://github.com/Konstantine899/resume/commit/331c502606d7ec2d25b91fe66bd8a1976148fdd2)), closes [#TS-errors](https://github.com/Konstantine899/resume/issues/TS-errors)
- **eslint:** исправлен путь к fsd-imports плагину ([7c257a9](https://github.com/Konstantine899/resume/commit/7c257a913d532cc7c4bbe33f54b44022ddc3708d))
- **features/contact:** устранён двойной скроллбар в секции Contact ([95b62d9](https://github.com/Konstantine899/resume/commit/95b62d961633b1f158a3d28ec3076066526c5e92)), closes [#double-scroll-issue](https://github.com/Konstantine899/resume/issues/double-scroll-issue)
- **fsd-styles:** исправить компиляцию SASS и layout Sidebar ([3a834b7](https://github.com/Konstantine899/resume/commit/3a834b7f8122228ea8449b60b30811af425d30d4))
- **gitignore:** negate .opencode/commands/ so new command files are trackable ([3161593](https://github.com/Konstantine899/resume/commit/3161593a8561778c5208d20b6a83571f3303046d))
- **husky:** упростить pre-commit хук ([7d7c420](https://github.com/Konstantine899/resume/commit/7d7c420ba2b8d4b395e6eaebb76a040d4bf0d03a))
- **image): скелетон загрузки, refactor(avatar:** вычистка дублей ([911dc9b](https://github.com/Konstantine899/resume/commit/911dc9b9705ad2835280ca7433497ecb7a1d98c0)), closes [#292726](https://github.com/Konstantine899/resume/issues/292726)
- **image:** srcSet from object src, i18n fallback, aria-describedby target (IMG-04/06/08) ([b65a193](https://github.com/Konstantine899/resume/commit/b65a1938af175f281a94f9d6d28b54f4977615f6))
- **InputGroup:** использовать className из props ([3a3a3b4](https://github.com/Konstantine899/resume/commit/3a3a3b45e3e47ff5a2572c74de992b32f20a04ed))
- **Input:** L1 + L3 low priority issues from code review ([84a2ffb](https://github.com/Konstantine899/resume/commit/84a2ffb292b715f587109a3a9f58adb5219260c9))
- **Input:** required-индикатор в CSS ::after вместо span в label ([4e47e0c](https://github.com/Konstantine899/resume/commit/4e47e0cb8cdee2ba3ffe2c1ff3bcdb9bedac7a69))
- **Input:** исправлены отступы для иконок ([5742e09](https://github.com/Konstantine899/resume/commit/5742e090d9d28b47dcf5a25416151684823faaf9))
- **Input:** код ревью — M1-M4 critical/medium + L2 low ([aae4ed5](https://github.com/Konstantine899/resume/commit/aae4ed5ee8a535009259d1e8e7aabb4504d0ced4))
- **Input:** отступы для иконок ([6f54c5f](https://github.com/Konstantine899/resume/commit/6f54c5ff4dc77a447207501aed419179f849b867))
- **Link:** case-insensitive _blank hardening (guard W1) ([bb130d0](https://github.com/Konstantine899/resume/commit/bb130d05eda99e05170d657b86cea695a78539e7))
- **Link:** do not reset display/gap in unstyled variant ([1cebe3f](https://github.com/Konstantine899/resume/commit/1cebe3f7a4ae61d3a9722867379f779d2940cb04))
- **Link:** final unstyled cleanup ([d6f3780](https://github.com/Konstantine899/resume/commit/d6f37807c165c37ae5fd11bcaf7f6ff8e868ee5a))
- **Link:** preserve consumer gap/align-items in unstyled variant ([2d5b3ef](https://github.com/Konstantine899/resume/commit/2d5b3ef22e35714b4c38b1170c36502a0ddca384))
- **Link:** preserve consumer padding/margin in unstyled variant ([de30678](https://github.com/Konstantine899/resume/commit/de306785463cc3931cd81de478876a894a7e985f))
- **Link:** replace all:unset with explicit property reset in unstyled ([fbff5b0](https://github.com/Konstantine899/resume/commit/fbff5b0ea18381731f3cc9327667af0acc4ec894))
- **lint:** починить pre-existing ESLint и stylelint ([2cc51a9](https://github.com/Konstantine899/resume/commit/2cc51a9e191ae43fef93926645721114117800d9))
- **Modal:** исправление критических проблем и добавление interaction тестов ([4decbcd](https://github.com/Konstantine899/resume/commit/4decbcdf5f5eda3c621d5e5d241979252466573c))
- **Modal:** код ревью — M1, M3-M5, L1-L3 (M2 skip, нет SSR) ([689abc3](https://github.com/Konstantine899/resume/commit/689abc3437011d41f0df7a76b38e19a85fb00707))
- **MyWork:** исправить описание проектов и стили Card ([27cf2b4](https://github.com/Konstantine899/resume/commit/27cf2b4fce86be146dc1cf217e68aa1b034ef40b))
- **overlay:** apply code-review fixes (a11y, pointer-events, scroll-lock, constants) ([8f1a94f](https://github.com/Konstantine899/resume/commit/8f1a94f295df56c12644f90cc458217eba53be5e))
- repair commit-msg hook silent no-op and enforce conventional commits ([ef65571](https://github.com/Konstantine899/resume/commit/ef65571a320ba6676ab4312d78dd7157e5bbded2))
- **section:** final polymorphic generics with proper types ([175f6d5](https://github.com/Konstantine899/resume/commit/175f6d59f747d9a00bf061b94260497dec5ffa64))
- **section:** resolve TS and ESLint errors in stories and component ([db4839a](https://github.com/Konstantine899/resume/commit/db4839a482fa26bb2940ef94b071a80fa4d82285))
- **section:** исправить SCSS ошибку с классом 2xl ([01eae71](https://github.com/Konstantine899/resume/commit/01eae7100614c3e9bcd529703dab13ce99b3dfe2))
- **shared/styles:** исправить ложные срабатывания SCSS анализатора ([23f52f1](https://github.com/Konstantine899/resume/commit/23f52f15bdd5321d287a164461dd6ecdf3424253))
- **shared:** avoid set-state-in-effect in useLQIP via async generation ([#8](https://github.com/Konstantine899/resume/issues/8)) ([8039d9a](https://github.com/Konstantine899/resume/commit/8039d9a516075d25c67e71a3d04571c02d5ce64d))
- **shared:** restore GitHub/LinkedIn brand icons as inline SVGs ([86f2e9c](https://github.com/Konstantine899/resume/commit/86f2e9c8fd917dcd82b087b31c40eb2d519f351d))
- **Sidebar/NavItem:** remove margin in expanded desktop mode ([066d45d](https://github.com/Konstantine899/resume/commit/066d45dfd421055d1f8889f979580f4cef35f7fb))
- **Sidebar:** add #experience to scroll detection sections ([27cc313](https://github.com/Konstantine899/resume/commit/27cc313a8b43e2bb288df1e0447aadfe1b236fd0)), closes [#experience](https://github.com/Konstantine899/resume/issues/experience) [#experience](https://github.com/Konstantine899/resume/issues/experience) [#work](https://github.com/Konstantine899/resume/issues/work)
- **skeleton:** исправить useEffect dependencies и вынести константы ([bf9ea3c](https://github.com/Konstantine899/resume/commit/bf9ea3cb657b00e0beeab186e73e6ff07f28e489))
- **skills:** исправить дубликат селектора .skillsSection в SCSS ([049a73a](https://github.com/Konstantine899/resume/commit/049a73ab402530fde4481598236f9434f3286e1b))
- **styles:** добавлены CSS переменные --border-color и --background-alt ([c945378](https://github.com/Konstantine899/resume/commit/c945378d17a035ae5b7019c29d376762e83445cb))
- **tests:** починить pre-existing падающие тесты ([5b0e68a](https://github.com/Konstantine899/resume/commit/5b0e68a3bb749dd7b9d14bc4a4518dbb37515c20))
- **toast:** refactor constants, fix progress bar, add context tests ([f974ce7](https://github.com/Konstantine899/resume/commit/f974ce7e76979a6a97195a2940c317d85d3ef75c))
- **toast:** заменить console.assert на expect в play-функциях stories ([75bc45d](https://github.com/Konstantine899/resume/commit/75bc45d53c7b6d24f073f0e1576d30f30d2033fc))
- **Toast:** исправить Sass синтаксис для Dart Sass ([cf6d661](https://github.com/Konstantine899/resume/commit/cf6d661557f63af635ca93444740e52ec3b73f52))
- **Tooltip:** исправить CRITICAL/MAJOR ревью-замечания R1-R4 ([d3c3067](https://github.com/Konstantine899/resume/commit/d3c3067ffe417474e521ef78d52dc925de997e20))
- **ui-kit:** Avatar и Card stories — убраны синие unsplash-фото, исправлены play-тесты ([c4a078b](https://github.com/Konstantine899/resume/commit/c4a078b156997b2021263198d048b9bae8abfdcd)), closes [2ea5b9/#306094](https://github.com/Konstantine899/resume/issues/306094) [#22c55e](https://github.com/Konstantine899/resume/issues/22c55e)
- **ui-kit:** code review Modal — чистка мёртвого кода, a11y-фиксы, focus trap guard ([5edfe36](https://github.com/Konstantine899/resume/commit/5edfe3653570b14cd035168721bd5f600ba058b4))
- **ui-kit:** Divider — настоящий polymorphic typing, merge style, thickness text divider ([a0b29cc](https://github.com/Konstantine899/resume/commit/a0b29ccc7e7054b4ad2e18d784a84917ed291238))
- **ui-kit:** Paragraph ревью — корректные имена тестов, защита от 'undefined' классов, dataAttrs через asChild ([d5dede7](https://github.com/Konstantine899/resume/commit/d5dede72c7256d1329fdac91c72ab9806c9fb704))
- **ui-kit:** use app --border-color for Divider line, drop dead token ([15ebbf8](https://github.com/Konstantine899/resume/commit/15ebbf8d036187039317e222498e9ee68b4a6848)), closes [#d1d5db](https://github.com/Konstantine899/resume/issues/d1d5db) [#4b5563](https://github.com/Konstantine899/resume/issues/4b5563)
- **ui/Label:** add height:1em to skeleton placeholder so it renders visibly ([26500b5](https://github.com/Konstantine899/resume/commit/26500b5cebd2d5673c6f0437651878d97baaa4ac))
- **ui/label:** satisfy stylelint rule-empty-line-before in mixins ([1431c81](https://github.com/Konstantine899/resume/commit/1431c81f87717bde104d10bf2dc8eabdc54c9c8d))
- **ui:** закрыть замечания 4R-ревью компонента Icon ([776cbf7](https://github.com/Konstantine899/resume/commit/776cbf73300874fb053c16941a00797164e353d7))
- **ui:** исправить delay footgun в Spinner и ужесточить тесты (SPR-03/04/07) ([99ae6ad](https://github.com/Konstantine899/resume/commit/99ae6adaf1ec162b5871bbd2a7fe857b41723ce4))
- **ui:** темо-зависимый цвет текста body и wrapper в Storybook ([31547d2](https://github.com/Konstantine899/resume/commit/31547d2d4be877c0324bd344bc1c1d34d61eed9e)), closes [#1a1716](https://github.com/Konstantine899/resume/issues/1a1716) [#1a1716](https://github.com/Konstantine899/resume/issues/1a1716) [#e8e6e3](https://github.com/Konstantine899/resume/issues/e8e6e3)
- **vite:** исправить инвертированную логику включения PurgeCSS ([d00848a](https://github.com/Konstantine899/resume/commit/d00848aaeacb31dcce9c1458ea4e4a2a5df0ce09))
- исправить FSD-нарушения и обновить stories компонентов ([4fff67f](https://github.com/Konstantine899/resume/commit/4fff67fb2eaf88b87dde790bb6a0c0854bd94e51))

### Features

- add comprehensive AvatarAbout and AvatarHero stories ([72d6675](https://github.com/Konstantine899/resume/commit/72d66758c1dadff315ffd86e31b332fd1d8087e8))
- **AnimatedSection:** upgrade to Senior+ level ([43cdeb2](https://github.com/Konstantine899/resume/commit/43cdeb2c768c0b99dc7041290c8da628c3f658b6))
- **Avatar:** Senior+ апгрейд — forwardRef, data-*, validation, AVATAR_CONSTANTS ([f0ac0b5](https://github.com/Konstantine899/resume/commit/f0ac0b53796ab1a501bff1b464ebe3a7765a9eeb))
- **Avatar:** добавить stories для Image/Group/Fallback/Badge и исправить цвет фона ([c83ca66](https://github.com/Konstantine899/resume/commit/c83ca66d2ca70473bf1c8e7222709ce31d2c2354)), closes [#f5f3f0](https://github.com/Konstantine899/resume/issues/f5f3f0) [#3a2e28](https://github.com/Konstantine899/resume/issues/3a2e28)
- **Avatar:** добавить Storybook stories для Badge, Group, Status ([8ddfdbb](https://github.com/Konstantine899/resume/commit/8ddfdbbc17c96e58c58d2849408667ac4642562e))
- **Avatar:** добавить компонент AvatarHero с 4-слойными стилями ([698f463](https://github.com/Konstantine899/resume/commit/698f46384a538a334a4892bdf321dee72b28dd5a)), closes [#f4b377](https://github.com/Konstantine899/resume/issues/f4b377)
- **Avatar:** создать компонент AvatarAbout для About секции ([1201cfd](https://github.com/Konstantine899/resume/commit/1201cfd76d0ca433b0e128aa287738e3ded9155a)), closes [#292726](https://github.com/Konstantine899/resume/issues/292726) [#f5f3f0](https://github.com/Konstantine899/resume/issues/f5f3f0) [#f4b377](https://github.com/Konstantine899/resume/issues/f4b377)
- **build:** migrate from webpack to vite with FSD architecture ([f57e3d8](https://github.com/Konstantine899/resume/commit/f57e3d87970d3408de1543a8ad7993fac484996b))
- **Button:** все 13 улучшений компонента Button завершены ([86d8fa4](https://github.com/Konstantine899/resume/commit/86d8fa4d89f892efeb003d3b5e28928fe36433ae))
- **Button:** добавлены размеры xs и xl (+10 тестов) ([e8ef05c](https://github.com/Konstantine899/resume/commit/e8ef05cf886a1eee057342dcdac91c2ad904b51a))
- **Button:** полиморфный component prop, useButton хук, ButtonLoader, icon size inference ([cf7a080](https://github.com/Konstantine899/resume/commit/cf7a0805f4a626f6e8039d78e905027b2fbf93b8))
- **Button:** рефакторинг по стандартам проекта + 2 loading variant ([1997807](https://github.com/Konstantine899/resume/commit/199780777ff666b1b073157982611641a214cbef))
- **Card:** Senior+ upgrade — data-*, displayName cleanup ([6d917ec](https://github.com/Konstantine899/resume/commit/6d917ecd4dc83caf65f4b4e0ce23a8388b3725f2))
- **Code:** скелетон блока теперь рендерит полную структуру с skeleton-заголовком ([fb5549f](https://github.com/Konstantine899/resume/commit/fb5549fbfc4908839d850d91a2148c7a8f6e5e7e))
- **config:** add /switch-profile command for model switching ([389f9d9](https://github.com/Konstantine899/resume/commit/389f9d96cd017ec8d59cc5e7b784901396b4b991))
- **config:** добавить CSS tree shaking через PurgeCSS для production сборки ([a24ecf9](https://github.com/Konstantine899/resume/commit/a24ecf9c1a4d6ea320442aeb727048ec1adcc805))
- **container:** создать новый layout компонент ([714ff35](https://github.com/Konstantine899/resume/commit/714ff35c65c1878a1f48ab78a32b8978c57f688a))
- **divider:** создать новый компонент разделителя ([3eadb36](https://github.com/Konstantine899/resume/commit/3eadb36648162157d2589087949f778792ea5af0))
- **entities:** добавить сущности Project, Job, Skill с типами и утилитами ([1ca8111](https://github.com/Konstantine899/resume/commit/1ca8111b010fbc3b91097fc93dd839175de248ef))
- **entities:** завершить миграцию Entities Layer и интеграцию в Features ([3d475c5](https://github.com/Konstantine899/resume/commit/3d475c5a7958ba1221f4aff2b0cb60266c9ae7cb))
- **features/about:** реализовать секцию "О себе" с темизацией ([94c7204](https://github.com/Konstantine899/resume/commit/94c7204dd28b936ca7aadb984925b07833d5b4ef)), closes [#migration-about-section](https://github.com/Konstantine899/resume/issues/migration-about-section)
- **features/contact:** полная миграция Contact на FSD + SASS ([ccf5fda](https://github.com/Konstantine899/resume/commit/ccf5fda468e8b01eeeeaac6b519869e74b0b5c56))
- **features/skills:** реализовать секцию "Навыки" с мультиязычностью ([19acc6c](https://github.com/Konstantine899/resume/commit/19acc6ce03b99bdb6946e780d74f9312949a4d37)), closes [#migration-skills-section](https://github.com/Konstantine899/resume/issues/migration-skills-section)
- **features/work-history:** pixel-perfect адаптация под оригинальный дизайн ([dca1062](https://github.com/Konstantine899/resume/commit/dca1062269cc1a58b85a341f0e27ba3d99e6e9ac)), closes [#WORK-42](https://github.com/Konstantine899/resume/issues/WORK-42)
- **features:** завершение структуры Hero, MyWork и WorkHistory по FSD ([760330a](https://github.com/Konstantine899/resume/commit/760330aeb2f6bd21ab43ec9dc752d786a7083f54))
- **features:** завершить ThemeSwitch и LanguageSwitch ([5dd1512](https://github.com/Konstantine899/resume/commit/5dd15125d42a080653c041ad626b4aac7e34d925)), closes [#3](https://github.com/Konstantine899/resume/issues/3)
- **fsd:** eslint-plugin-fsd-imports создан ([0a737e3](https://github.com/Konstantine899/resume/commit/0a737e36f50b49036c4af06cb8c993d0de965ef9))
- **fsd:** Layer Purity Metrics v2.0 — Concrete & Measurable ([dcbe9e8](https://github.com/Konstantine899/resume/commit/dcbe9e8ffe7790f0c864c46ae07837cf61ab1ee4))
- **fsd:** добавить eslint-правило tests-public-api-only ([b3cc9af](https://github.com/Konstantine899/resume/commit/b3cc9afc022bb0f75fcbf2f54c569290abf13e02))
- **fsd:** инициализация FSD архитектуры с shared слоем ([2d341e4](https://github.com/Konstantine899/resume/commit/2d341e40e7e759f630cf75f9ac0f0f6003152d37))
- **Heading:** remove export default, clean up displayName, rewrite stories ([71e8df4](https://github.com/Konstantine899/resume/commit/71e8df426667fd325fa758fde027743967b054f2))
- **Hero:** integrate AvatarHero component ([b436074](https://github.com/Konstantine899/resume/commit/b4360740917e7978a13a8159b68cf6f0809f43ed))
- **hero:** миграция Hero на FSD с SCSS модулями и i18n ([03b6928](https://github.com/Konstantine899/resume/commit/03b69289ca72da5ae012402d0037b4d256c377b3))
- **i18n:** добавить провайдер инициализации i18next ([6e5b716](https://github.com/Konstantine899/resume/commit/6e5b716f95f9627211f6613c9f2247cd74a1c57b)), closes [#i18n-initialization](https://github.com/Konstantine899/resume/issues/i18n-initialization)
- **icon:** adopt Icon in Input & Code ([0e539da](https://github.com/Konstantine899/resume/commit/0e539dad440786abc50ec99e6d262aa1ac4d5df7))
- **icon:** adopt Icon in Modal & Toast ([71febc8](https://github.com/Konstantine899/resume/commit/71febc860fc2930477b6ca9aa856826758194b30))
- **icon:** adopt Icon in Sidebar, toggles & Contact ([611a819](https://github.com/Konstantine899/resume/commit/611a819d2babcbf3fe054c12cd3f3eb556e4009d))
- **IconButton:** добавить loading states для Sidebar ([466f00f](https://github.com/Konstantine899/resume/commit/466f00feaf4ca54b664531cd07cb78a5ceabafb4))
- **Icon:** polymorphic component prop with type-safe refs and a11y fork ([9d710a8](https://github.com/Konstantine899/resume/commit/9d710a84068f7447c3aace79c796c0e2b515b44b))
- **Icon:** remove export default, strip inline useMemo, rewrite stories ([b9793b8](https://github.com/Konstantine899/resume/commit/b9793b8dcb3c2781688779782dd8d0da0ae4769d))
- **Icon:** полная переработка Storybook stories и добавление цветов темы ([4d4eb6d](https://github.com/Konstantine899/resume/commit/4d4eb6d1b9c4a4215ef92e9035635592c06a354a))
- **image:** add Image component with tests, stories, and config fixes ([aaef905](https://github.com/Konstantine899/resume/commit/aaef9055991464c93bb77b72e095ce98850b688f))
- **image:** add LQIP, drag-drop and format detection helpers (Phase 7) ([182d629](https://github.com/Konstantine899/resume/commit/182d6291cbb8cccce42a0048fffa4f4b20959a36))
- **image:** integrate shared UI Kit, add spinner placeholder, trim stories ([983623f](https://github.com/Konstantine899/resume/commit/983623fac4168e0c3c0d4ea5f6d3ddb8e67cd557))
- **Input:** 100% completion — xs/xl sizes, asChild, edge cases, InputPhone, InputEmail ([e4dfe15](https://github.com/Konstantine899/resume/commit/e4dfe15695a55cf40d4cbf61654efc624cc2c210))
- **Input:** 66 тестов, accessibility, 13 stories, CSS переменные ([6bb0fc4](https://github.com/Konstantine899/resume/commit/6bb0fc4519bf327f6e7c2183283f7c4d742af512))
- **Input:** CharacterCounter, ClearButton, FloatingLabel, CSS переменные ([23f3775](https://github.com/Konstantine899/resume/commit/23f377587e1203f2fc5a4fdc197a7ec956d0e891))
- **Input:** оптимизация производительности и покрытие тестов ([36d1ff7](https://github.com/Konstantine899/resume/commit/36d1ff7276a2c999d63b9059463a5f6fa77dff75))
- **Input:** полиморфный component prop, useInput/usePasswordToggle хуки, InputSearch, icon size inference, interactive stories, conditional types ([83cebd0](https://github.com/Konstantine899/resume/commit/83cebd0d7ba712821663790ec4b88865bd33ce21))
- **Label:** улучшить компонент до Senior+ уровня ([a8a0e25](https://github.com/Konstantine899/resume/commit/a8a0e258f65ca596bf9264bf234f5e231d3c2d60))
- **Link:** полиморфный component prop, useLink hook, LinkSkeleton и утилиты внешних ссылок ([773e074](https://github.com/Konstantine899/resume/commit/773e0746d1ceb07f5ab032e3881e8c45fe630258))
- **mcp:** добавить Serena MCP через WSL для навигации по коду ([c5f08a5](https://github.com/Konstantine899/resume/commit/c5f08a5a062b82011d43788d189f5ef3690bfe96))
- **Modal:** Senior+ апгрейд — forceMount, onEscapeKeyDown, onPointerDownOutside, finalFocusRef, defaultOpen, non-modal mode ([c0c43e7](https://github.com/Konstantine899/resume/commit/c0c43e7f491d8ba502f549abc15f52116d0e3dcb))
- **Modal:** улучшение компонента до 10/10 ([5f74b8c](https://github.com/Konstantine899/resume/commit/5f74b8c6ad56c9ec92b8b328ae1374fd82a79262))
- **opencode:** enable selective typescript LSP ([f445bcb](https://github.com/Konstantine899/resume/commit/f445bcbff6cd91eeda615d4a9c8b3b08388a74e2))
- **opencode:** добавить agent-specific permissions для 10 агентов ([5691d74](https://github.com/Konstantine899/resume/commit/5691d74d3dced52030eb5167f5ed39b51cace53e))
- **opencode:** интеграция AI агентов с плагинами и MCP серверами (Phase 1 + Phase 2) ([9109ef9](https://github.com/Konstantine899/resume/commit/9109ef9bb57f9bd3ea318428752165f24fc3d7ca))
- **Paragraph:** внедрение Paragraph в About, Contact, Skills, MyWork (Phase 4/5) ([7dd2152](https://github.com/Konstantine899/resume/commit/7dd215280606564c4244f9fb48653728593e0983))
- **Paragraph:** внедрение Paragraph в MobileMenu.footerText (Phase 5/5) ([c9d7600](https://github.com/Konstantine899/resume/commit/c9d760015ce8302fe2bd28e9c4cd76a4c055d2df))
- **Paragraph:** внедрение Paragraph в Popover.title (Phase 3/5) ([48dfb8b](https://github.com/Konstantine899/resume/commit/48dfb8bcd687232995d627f20d603eeba4eee89a))
- **Paragraph:** внедрение Paragraph в ProjectCard и WorkHistoryCard ([e37725f](https://github.com/Konstantine899/resume/commit/e37725fbfba4d3aae613be13ce69b88558f3ca31))
- **Paragraph:** внедрение Paragraph в Toast, Label, Input, Textarea (Phase 2/5) ([3574fb0](https://github.com/Konstantine899/resume/commit/3574fb02b5c8060e0dbd478e795691526bc88511))
- **Paragraph:** улучшить компонент до Senior+ уровня ([4de8e4d](https://github.com/Konstantine899/resume/commit/4de8e4d161bc273bdb75c8a97bf03e8b726dcbad))
- **performance:** Memory Leak Detection v2.0 ([5d031f5](https://github.com/Konstantine899/resume/commit/5d031f5341adc41e4df906601da3b2ba8ffb5785))
- **performance:** Performance Budget Enforcement v2.0 ([52a726c](https://github.com/Konstantine899/resume/commit/52a726c73b1abd3d968afa6f13b89368d04001f1))
- **performance:** Render Time Thresholds v2.0 — Realistic & Categorized ([1e70dd6](https://github.com/Konstantine899/resume/commit/1e70dd6ae762541dac0e21559c87e327c2716dd6))
- **Popover:** реализовать план улучшений ui-kit-improvement-popover (9 CRITICAL) ([f601798](https://github.com/Konstantine899/resume/commit/f6017986534e01ddbbdb228a35ff5ced974dc37a))
- **Popover:** улучшить компонент до Senior+ уровня ([24dd7ae](https://github.com/Konstantine899/resume/commit/24dd7aee0e1453527e7eed865898618829e63316))
- **portal:** добавить disablePortal prop, удалить runtime валидацию ([181f4e9](https://github.com/Konstantine899/resume/commit/181f4e9de7594b2812c17d6161f9ee82696a7a0e))
- **react:** Error Boundary Runtime Check v2.0 ([6fcea1b](https://github.com/Konstantine899/resume/commit/6fcea1b9b2e98d5b7fc996718481a912cd12aee4))
- **section:** создать новый layout компонент ([1950f6b](https://github.com/Konstantine899/resume/commit/1950f6bad258c541d418995f5694af920a9e4b47))
- **security:** Audit Log Integrity v2.0 — HMAC + Encryption ([63908a4](https://github.com/Konstantine899/resume/commit/63908a4a984517e5168d9b6f505f287b4bc2c3b8))
- **security:** Command Injection + Credentials Detection v2.0 ([5f603fd](https://github.com/Konstantine899/resume/commit/5f603fdcb51190a0935c18fe65b70a3445ed0236))
- **security:** P0 Critical уязвимости — Phase 1 Complete ([3766d59](https://github.com/Konstantine899/resume/commit/3766d591ecf8fae70bb8e18ba76f7ce8623bc79d))
- **shared-ui:** улучшение Portal и Overlay до Senior+ уровня ([ed66e08](https://github.com/Konstantine899/resume/commit/ed66e0897c55ac29a0259fb679f2a57734e25fe3))
- **shared/i18n:** переместить конфигурацию i18next в shared layer ([6137965](https://github.com/Konstantine899/resume/commit/6137965976f6314f60e83efe42d8ec1243058a76))
- **shared/styles:** декомпозировать animations модуль ([08d4f31](https://github.com/Konstantine899/resume/commit/08d4f3116564f3755d7b808572ecfc6d6ca6c72c))
- **shared/styles:** декомпозировать mixins модуль ([d3c5dd2](https://github.com/Konstantine899/resume/commit/d3c5dd2d798f148e987dd8a16a74539faa29f3b5))
- **shared/styles:** декомпозировать mixins модуль ([f6dda34](https://github.com/Konstantine899/resume/commit/f6dda346c1daec1b9083e4eac6d3e7da4c69fe6b))
- **shared/styles:** декомпозировать variables модуль ([9563511](https://github.com/Konstantine899/resume/commit/9563511e46bc7bf8617421acdd2a1f926b3dea81))
- **shared/styles:** добавить переменные z-index и исправить Overlay ([101c9d7](https://github.com/Konstantine899/resume/commit/101c9d7c4079416f744851416e253c29c592da0d)), closes [#UI-Kit](https://github.com/Konstantine899/resume/issues/UI-Kit)
- **shared/ui/Code:** модернизация до Senior+ уровня ([1a21fae](https://github.com/Konstantine899/resume/commit/1a21fae3c14a34c5f3253404c43b7b1b80c3a162))
- **shared/ui/Portal:** добавить компонент для рендеринга вне DOM иерархии ([30a0897](https://github.com/Konstantine899/resume/commit/30a08975837ed482c94bd199fcec6ef08dd91c39))
- **shared/ui:** добавить Avatar компонент с hero-стилями ([70f8cdb](https://github.com/Konstantine899/resume/commit/70f8cdbc17305e7dbb1d3e5327f5829ee54b2aa9))
- **shared/ui:** добавить Icon компонент для работы с иконками ([bfea3bc](https://github.com/Konstantine899/resume/commit/bfea3bcef6e947834df8c33cc043ac2d85937376))
- **shared/ui:** добавить Link компонент с темизацией ([a1564a6](https://github.com/Konstantine899/resume/commit/a1564a69d91febe8c13b3e924870211ea9d60f8d)), closes [#LINK-1](https://github.com/Konstantine899/resume/issues/LINK-1)
- **shared/ui:** добавить Loader компонент с тремя вариантами ([432b538](https://github.com/Konstantine899/resume/commit/432b5387aa324214294e95186803487802395ccf))
- **shared/ui:** добавить Popover компонент с позиционированием ([64aea51](https://github.com/Konstantine899/resume/commit/64aea51c1cf62f170f2f2b16fcb537e99b67525e))
- **shared/ui:** добавить Popover компонент с позиционированием ([cad81ed](https://github.com/Konstantine899/resume/commit/cad81ed70f0aeae50f6994a73be8ee12c5feee80))
- **shared/ui:** добавить компонент Label ([eccfb9e](https://github.com/Konstantine899/resume/commit/eccfb9ef842cabe329ac3731173e7d24af4c8a10)), closes [#123](https://github.com/Konstantine899/resume/issues/123)
- **shared/ui:** добавить компонент Modal с хуком useModal ([5fcbe5a](https://github.com/Konstantine899/resume/commit/5fcbe5a3e1901e26494e86f8e190e5d6470818c4)), closes [#FSR-XX](https://github.com/Konstantine899/resume/issues/FSR-XX)
- **shared/ui:** добавить компонент Skeleton для состояний загрузки ([057c597](https://github.com/Konstantine899/resume/commit/057c5977047e66a4f563065cbcea4a7fe6682f37))
- **shared/ui:** добавить компонент Tooltip с декомпозированной логикой ([3786e45](https://github.com/Konstantine899/resume/commit/3786e45ab40a013c8e5bd2def552bf0befae87c3)), closes [#7](https://github.com/Konstantine899/resume/issues/7)
- **shared/ui:** добавить компоненты типографики Heading и Paragraph ([3b2ab08](https://github.com/Konstantine899/resume/commit/3b2ab083d068da922e9c4367584aa2d859863087)), closes [#FSF-12](https://github.com/Konstantine899/resume/issues/FSF-12)
- **shared/ui:** завершить реализацию Avatar компонента по FSD ([0528cd5](https://github.com/Konstantine899/resume/commit/0528cd5bf0d58d635214e68e147be44ed46f4f2d))
- **shared/ui:** обновить Avatar компонент с использованием новых утилит ([b7f3a3d](https://github.com/Konstantine899/resume/commit/b7f3a3d3b5a01b58329336bff12ef7d787485547)), closes [#AVATAR-1](https://github.com/Konstantine899/resume/issues/AVATAR-1)
- **shared/ui:** создать компонент IconButton и внедрить в Sidebar ([4b7e52b](https://github.com/Konstantine899/resume/commit/4b7e52be8160d9cc483ee4b020c056174f94d115))
- **shared/ui:** улучшить Code компонент и исправить Toast ([68f84e6](https://github.com/Konstantine899/resume/commit/68f84e6ef3864f5f87074930a20f536e59496a87)), closes [#Code-Toast-Improvements](https://github.com/Konstantine899/resume/issues/Code-Toast-Improvements)
- **shared:** добавить IconButton компонент и рефакторинг ToggleButton ([23e5e96](https://github.com/Konstantine899/resume/commit/23e5e961bdf248029ac1c621241a2339766fe9b3))
- **shared:** переместить контексты тем и языка в shared слой ([cb22b93](https://github.com/Konstantine899/resume/commit/cb22b93006fa74d26d39c6a36a312315c5687e83))
- **sidebar:** добавить keyboard навигацию и focus trap ([588b506](https://github.com/Konstantine899/resume/commit/588b5069fe700b22e445ebbad734ef974e7f62aa))
- **skeleton:** добавить тесты, оптимизации и reduced motion поддержку ([44ae008](https://github.com/Konstantine899/resume/commit/44ae0089e9f9fc88fd7b2d640e04d9b87208ba13))
- **skills:** добавить constraint-скилл i18n-first ([c78d29f](https://github.com/Konstantine899/resume/commit/c78d29fc6958a296b636183a2c06d62f29b964ab))
- **skills:** добавить constraint-скилл reuse-first ([bea5fde](https://github.com/Konstantine899/resume/commit/bea5fded2c6d5b00bdfe7486248f847e7e789073))
- **Spinner:** Senior+ апгрейд — forwardRef, data-*, i18n, play stories ([4f62a95](https://github.com/Konstantine899/resume/commit/4f62a955e329a163a03711178e4b668d5f24db6a))
- **stage-1:** critical i18n fixes and Developer entity ([0864f85](https://github.com/Konstantine899/resume/commit/0864f85fae1a57656906480f3f0e213ad4c654ba)), closes [#I18N-](https://github.com/Konstantine899/resume/issues/I18N-)
- **stage-2:** improve Button component typing and performance ([9e0b320](https://github.com/Konstantine899/resume/commit/9e0b3208316672b93d65c51d331b3fbf8e5f46ca)), closes [#BTN-TYPE-001](https://github.com/Konstantine899/resume/issues/BTN-TYPE-001) [#BTN-OVERLOAD-001](https://github.com/Konstantine899/resume/issues/BTN-OVERLOAD-001) [#BTN-REF-001](https://github.com/Konstantine899/resume/issues/BTN-REF-001) [#BTN-PERF-001](https://github.com/Konstantine899/resume/issues/BTN-PERF-001)
- **storybook:** добавить Stories для UI компонентов Shared layer ([0988b41](https://github.com/Konstantine899/resume/commit/0988b41751b8998bc6137e3760f512d34358ce00))
- **storybook:** настроить конфигурацию для FSD проекта ([789cbfc](https://github.com/Konstantine899/resume/commit/789cbfccc86a9681da471dab86b889adcc337910)), closes [#storybook-setup](https://github.com/Konstantine899/resume/issues/storybook-setup)
- **testing:** Coverage Fake Protection v2.0 ([4a773b7](https://github.com/Konstantine899/resume/commit/4a773b7025f70202871a714d3b16b8a1230af488))
- **testing:** Flaky Test Automation v2.0 ([cdaa972](https://github.com/Konstantine899/resume/commit/cdaa9726f689bebad442d7bb6a398276ece54953))
- **textarea:** revive with Senior+ a11y/UX improvements ([6dc33fe](https://github.com/Konstantine899/resume/commit/6dc33fe7fb20437ded0b8ef8bc9b13bb8e90d475))
- **textarea:** upgrade to Senior+ with full a11y and controlled/uncontrolled ([7ed4d20](https://github.com/Konstantine899/resume/commit/7ed4d206341919ec83bd1a715dbcd10f8c3e553f))
- **toast:** интеграция Toast-уведомлений с Contact формой и EmailJS ([8aaacdd](https://github.com/Konstantine899/resume/commit/8aaacdd4e63fb64bf5ffe8f6d9432c74fc8a29ad))
- **Toast:** обновить стили до Senior+ уровня (2026) ([210bf14](https://github.com/Konstantine899/resume/commit/210bf147039bf22045abaff10a4cc441025fb247))
- **Toast:** улучшить компонент до Senior+ уровня ([5f3a767](https://github.com/Konstantine899/resume/commit/5f3a767b8346d6ac7560daad20e214a921b51bdb))
- **Tooltip:** реализовать план улучшений ui-kit-improvement-tooltip (22/25) ([3b493a3](https://github.com/Konstantine899/resume/commit/3b493a38bae93b2b31983afad95dae280b559edd))
- **ui-input:** implement 13 improvements — forwardRef, skeleton, validation, data-attrs, stories play, SCSS fix ([47756af](https://github.com/Konstantine899/resume/commit/47756af865feba3fee25b8914167361997d041b5))
- **ui-kit:** Divider — polymorphic as, useDivider hook, thickness bug fix, text divider ([0f7bcb3](https://github.com/Konstantine899/resume/commit/0f7bcb36dc19f0bc74f90ac2a2c77e06592fb9fc))
- **ui-kit:** improve Image component — JSDoc, IMAGE_CONSTANTS, data-attributes, useMergeRefs ([37bee90](https://github.com/Konstantine899/resume/commit/37bee90faca5e49ae5c0b9297aa5948b59659e0d))
- **ui-kit:** improve Label component — LABEL_CONSTANTS, validateLabelProps, skeleton mode, data-attributes ([5f84edd](https://github.com/Konstantine899/resume/commit/5f84edd79ca8252522f6f757b7fcb28df14950cb))
- **ui-kit:** improve Link component — LINK_CONSTANTS, validateLinkProps, skeleton mode, memo fix ([c57de63](https://github.com/Konstantine899/resume/commit/c57de631c21ec6840564ae170bfdb8e6771a2cbb))
- **ui-kit:** Paragraph — polymorphic as, useParagraph hook, tertiary/gradient themes, dead code, Card/Modal integration ([e71446b](https://github.com/Konstantine899/resume/commit/e71446ba350d8b6d67b74884430ef13fcaeb489a))
- **ui-kit:** апгрейд Paragraph до senior+ уровня — as, weight, truncate, wrap, asChild + Slot компонент ([a514f3a](https://github.com/Konstantine899/resume/commit/a514f3a677337ce37bb6a98d80f09fce65018ab6))
- **ui-kit:** интеграция Container в Card и улучшение JSDoc ([69473dc](https://github.com/Konstantine899/resume/commit/69473dc5b7ad1ae345e1eed3a0c0018e2e1f26b5))
- **ui-kit:** полная реализация Section (13 задач) ([ec2b6ba](https://github.com/Konstantine899/resume/commit/ec2b6baafd2b4bde7f2d02d3a16dcd9dae1db864))
- **ui-kit:** улучшен Avatar — polymorphic, useAvatar, compound API, FSD ([baad3fa](https://github.com/Konstantine899/resume/commit/baad3fafc8d9d414046bdfd166f720b802830fae))
- **ui-kit:** улучшен компонент Card и добавлены compound-компоненты ([2db709f](https://github.com/Konstantine899/resume/commit/2db709fcfd33d424c7f07f3cb139ec942d0f3c3d))
- **ui-overlay:** implement 10 improvements (C1-C2, I1-I5, M1-M3) ([d18bd13](https://github.com/Konstantine899/resume/commit/d18bd13f2283022d178e6b314974c10883d864c1))
- **ui-popover:** constants refactor, extract validation, add exports ([476e77f](https://github.com/Konstantine899/resume/commit/476e77f371bb8ffc4996ade1063044201422a45c))
- **ui-portal:** implement 8 improvements (C1-C2, I1-I4, M1-M2) ([752f520](https://github.com/Konstantine899/resume/commit/752f520f3346999332e9c05262950e17c144bf24))
- **ui-section:** constants refactor, data-attributes, stories consolidation ([44d1232](https://github.com/Konstantine899/resume/commit/44d12322f750637df9f90cd720a2cae5e61a0ef7))
- **ui-skeleton:** constants refactor, forwardRef, data-attributes, CSS variables ([882be39](https://github.com/Konstantine899/resume/commit/882be393bd73c9d2d851467e3dd9f100823604e1))
- **ui-tooltip:** implement T1-T10 improvements ([819ff9e](https://github.com/Konstantine899/resume/commit/819ff9e29064efe19bfd8804003bd646a3698b6e))
- **ui:** add AspectRatio component (AR-01..AR-09) ([146c29c](https://github.com/Konstantine899/resume/commit/146c29ca81b8dd8bbfc7d249e59902a72fb39e5c))
- **ui:** ErrorBoundary slice + Image load-error diagnostics (ERB-01..06) ([4fd94a9](https://github.com/Konstantine899/resume/commit/4fd94a9131313dbcfab68e3b124081832b550acc))
- **ui:** extract useKeyboardAction and complete Icon tracker stories ([f840acd](https://github.com/Konstantine899/resume/commit/f840acd3598d7d20c354508918775ac06dc1dcf8))
- **ui:** revive Label and bring to Senior+ (6 SR improvements + floating) ([00937c8](https://github.com/Konstantine899/resume/commit/00937c889398431d6988e2b9b8a8bba28274c134))
- **ui:** Skeleton — полиморфизм as, useSkeleton, CSS-переменные, тесты (SKL-01..07) ([1f2dd31](https://github.com/Konstantine899/resume/commit/1f2dd312cef40927aa0c54025daf8661ee5ad38c))
- **ui:** добавить Skeleton с ripple-анимацией в Avatar компоненты ([632a59e](https://github.com/Konstantine899/resume/commit/632a59ef127303c62ef71d2b4d753d7bfa036d19)), closes [#292726](https://github.com/Konstantine899/resume/issues/292726) [#f5f3f0](https://github.com/Konstantine899/resume/issues/f5f3f0)
- **ui:** завершить Skeleton — rounded, staggerStep, CSS-var highlight, loading wrapper ([b505ba1](https://github.com/Konstantine899/resume/commit/b505ba12846549532365a77ecfb426491d989141))
- **widgets/sidebar:** добавить tooltip для навигационных иконок ([def3214](https://github.com/Konstantine899/resume/commit/def32142de0988465511cbe681383df2e0cfeb50)), closes [#UX-1](https://github.com/Konstantine899/resume/issues/UX-1)
- **widgets/sidebar:** добавить tooltip и клик по всему sidebar ([0f4f8ce](https://github.com/Konstantine899/resume/commit/0f4f8ce502116e20088a9748bf993191ba7f4e5b)), closes [#UX-1](https://github.com/Konstantine899/resume/issues/UX-1) [#UX-2](https://github.com/Konstantine899/resume/issues/UX-2)
- **widgets/sidebar:** добавить сохранение состояния в localStorage ([ce07438](https://github.com/Konstantine899/resume/commit/ce07438814a62ec0f517ed47136924d789734d23)), closes [#UX-4](https://github.com/Konstantine899/resume/issues/UX-4)
- **widgets/sidebar:** полная миграция на SASS модули и исправление стилей ([191709a](https://github.com/Konstantine899/resume/commit/191709a77b74bc69fb7fb508a3061120e4ea378e))
- **widgets/sidebar:** реализовать hover-to-expand с задержкой 300ms ([666e99b](https://github.com/Konstantine899/resume/commit/666e99b44311845e0ea0ec158895374834b4d63d)), closes [#UX-3](https://github.com/Konstantine899/resume/issues/UX-3)
- **widgets/sidebar:** реализовать сворачивание сайдбара по клику ([d3d890f](https://github.com/Konstantine899/resume/commit/d3d890f0b27fa2e01255fcfd295c79aa244e4969)), closes [#sidebar-collapse](https://github.com/Konstantine899/resume/issues/sidebar-collapse)
- Добавил mcp servers в package.json ([c800b90](https://github.com/Konstantine899/resume/commit/c800b902095ec30c696e6f0601f9bbcc8454b709))
- добавить конфигурацию OpenCode с чистой архитектурой ([a503650](https://github.com/Konstantine899/resume/commit/a50365055611c9438de91637d05d78558fc71a79))
- завершены все улучшения Modal (🔴🟡🟢) ([4266b45](https://github.com/Konstantine899/resume/commit/4266b45d27dee33e5e3f4c846640e630edf4dfa8))
- интеграция EmailJS и Toast уведомлений в Contact форму ([d3213ee](https://github.com/Konstantine899/resume/commit/d3213ee6c5f9f4ce46a5ca9c036526f196fc0458))

### Performance Improvements

- **sidebar:** оптимизировать анимацию и улучшить a11y ([6d27754](https://github.com/Konstantine899/resume/commit/6d27754a3cfb4d5790b086593dd6260aaaf1f7e0))

### Reverts

- удалить ненужные плагины созданные во время аудита ([932e6dc](https://github.com/Konstantine899/resume/commit/932e6dc4c59b1cd3964971e59a02bc4c5d8a1358))

### BREAKING CHANGES

- **shared/ui/Code:** нет, публичный API сохранён
- **Button:** Button разделён на 3 специализированных компонента

🎯 Архитектура (по стандарту Avatar):

- Button — текстовые кнопки
- IconButton — icon-only кнопки (с обязательным ariaLabel)
- ButtonWithIcon — текст + иконка (leftIcon/rightIcon)

✨ Новые возможности:

- loadingVariant='spinner' — Loader компонент (по умолчанию)
- loadingVariant='skeleton' — Skeleton компонент

📐 Типы (model/types.ts):

- ButtonProps — только children
- IconButtonProps — icon + ariaLabel (обязательно!)
- ButtonWithIconProps — children + leftIcon? + rightIcon?
- LoadingVariant — 'spinner' | 'skeleton'

🧪 Тесты (76 тестов, 100% покрытие):

- Button.test.tsx — 27 тестов
- IconButton.test.tsx — 22 теста
- ButtonWithIcon.test.tsx — 27 тестов

📚 Stories:

- Button.stories.tsx — 13 stories (variants, sizes, loading)
- IconButton.stories.tsx — 13 stories (gallery, sizes)
- ButtonWithIcon.stories.tsx — 15 stories (left/right icons)

♿ Accessibility:

- aria-busy={loading} для всех кнопок
- aria-disabled={disabled || loading}
- IconButton требует ariaLabel

🗑️ Удалено:

- ButtonMode тип (не использовался)
- iconPosition (заменено на leftIcon/rightIcon)
- rotation (не по стандартам проекта)
- icon, children булевы режимы

📦 Интеграции:

- Loader — для loadingVariant='spinner'
- Skeleton — для loadingVariant='skeleton'

* **shared/i18n:** Импорт хука изменён с:
  import { useLanguage } from '@/features/LanguageSwitch'
  На:
  import { useLanguage } from '@/shared/lib/i18n/hooks'

  Компонент LanguageSwitch доступен через:
  import { LanguageSwitch } from '@/features/LanguageSwitch'
