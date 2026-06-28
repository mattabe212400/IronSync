import WorkoutForm from '../components/WorkoutForm'

export default function GenerateWorkoutPage() {
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '30px', fontWeight: 900, color: '#ffffff' }}>Generate Workout</h1>
        <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: '15px' }}>
          Tell us about your goals and we'll build the perfect plan
        </p>
      </div>
      <WorkoutForm />
    </div>
  )
}
