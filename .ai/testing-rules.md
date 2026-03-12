# Testing Rules

Testing framework: Karma + Jasmine

> Note: Vitest migration is planned for a later phase. Do not introduce Vitest now.

## Allowed testing APIs

Use the Jasmine testing API:

- describe()
- it()
- expect()
- beforeEach()
- afterEach()

Spies and mocks:

- jasmine.createSpy()
- spyOn()

## Angular testing

Use TestBed for Angular component and service tests.

Priority order:

1. Pure function tests (no TestBed needed)
2. Service tests with TestBed
3. Angular integration tests using TestBed

## Component tests

When testing components:

- Use TestBed.configureTestingModule()
- Prefer importing standalone components directly when possible
- Mock dependencies with jasmine.createSpy() or simple stub objects

Example pattern:

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

## Async testing

Zone.js is still active — fakeAsync/tick are allowed.

Allowed:

- fakeAsync()
- tick()
- flush()
- async/await with fixture.whenStable()
