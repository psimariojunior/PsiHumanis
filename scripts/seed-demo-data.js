const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const psychologist = await prisma.user.findUnique({ where: { email: 'psi_mariojunior@hotmail.com' } })
  if (!psychologist) { console.error('Psychologist not found'); return }
  console.log(`Found psychologist: ${psychologist.name} (${psychologist.id})`)

  const patients = await prisma.patient.findMany({ where: { psychologistId: psychologist.id } })
  console.log(`Found ${patients.length} patients`)

  if (patients.length === 0) {
    console.error('No patients found. Create patients first.')
    return
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const appointments = []
  const patientNames = ['Ana Souza', 'Carlos Lima', 'Fernanda Costa', 'Lucas Oliveira', 'Mariana Santos']
  
  // Create 3 patients if we only have test patients
  for (let i = patients.length; i < 5; i++) {
    const name = patientNames[i] || `Paciente ${i + 1}`
    const patient = await prisma.patient.create({
      data: {
        name,
        email: `${name.toLowerCase().replace(/\s/g, '.')}@email.com`,
        phone: `(31) 9${String(9000 + i).padStart(4, '0')}-000${i}`,
        psychologistId: psychologist.id,
        cpf: `${100 + i}.000.000-${String(i).padStart(2, '0')}`,
        dateOfBirth: new Date(1990 + i, 5, 15),
        gender: i % 2 === 0 ? 'Feminino' : 'Masculino',
      }
    })
    patients.push(patient)
    console.log(`Created patient: ${name}`)
  }

  // Helper to create appointment
  const createApt = async (daysOffset, hour, minute, patientIdx, status, price = 250) => {
    const start = new Date(today)
    start.setDate(start.getDate() + daysOffset)
    start.setHours(hour, minute, 0, 0)
    const end = new Date(start)
    end.setMinutes(end.getMinutes() + 50)

    return prisma.appointment.create({
      data: {
        startTime: start,
        endTime: end,
        status,
        modality: 'online',
        price,
        paid: status === 'COMPLETED',
        paymentMethod: status === 'COMPLETED' ? 'pix' : null,
        title: `Sessão - ${patients[patientIdx % patients.length].name}`,
        psychologistId: psychologist.id,
        patientId: patients[patientIdx % patients.length].id,
      }
    })
  }

  // Today's appointments
  await createApt(0, 9, 0, 0, 'CONFIRMED')
  await createApt(0, 14, 0, 1, 'SCHEDULED')
  
  // Yesterday
  await createApt(-1, 10, 0, 2, 'COMPLETED', 250)
  await createApt(-1, 15, 0, 0, 'COMPLETED', 250)
  
  // 2 days ago
  await createApt(-2, 9, 30, 3, 'COMPLETED', 200)
  await createApt(-2, 14, 30, 1, 'COMPLETED', 200)
  
  // Last week
  await createApt(-7, 10, 0, 0, 'COMPLETED', 250)
  await createApt(-6, 14, 0, 2, 'COMPLETED', 250)
  await createApt(-5, 9, 0, 4, 'COMPLETED', 200)
  await createApt(-4, 15, 0, 1, 'COMPLETED', 250)
  await createApt(-3, 10, 0, 3, 'COMPLETED', 200)
  
  // Upcoming
  await createApt(1, 9, 0, 0, 'CONFIRMED')
  await createApt(1, 14, 0, 2, 'SCHEDULED')
  await createApt(2, 10, 0, 3, 'CONFIRMED')
  await createApt(3, 14, 0, 4, 'SCHEDULED')
  await createApt(5, 9, 0, 1, 'SCHEDULED')
  await createApt(7, 10, 0, 0, 'CONFIRMED')

  // A cancelled one
  await createApt(-1, 9, 0, 4, 'CANCELLED')

  console.log(`\nCreated ${19} appointments`)
  console.log('Done!')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
