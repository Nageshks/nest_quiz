import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create a course with updated subject, module, and set theory questions
  await prisma.course.create({
    data: {
      name: "BCA",
      semesters: {
        create: [
          {
            name: "Semester 1",
            subjects: {
              create: [
                {
                  name: "Basic Mathematics",
                  modules: {
                    create: [
                      {
                        name: "Set Theory and Matrices",
                        questions: {
                          create: [
                            {
                              question: "Which of the following is a subset of every set?",
                              options: { A: "Universal set", B: "Empty set", C: "Singleton set", D: "Finite set" },
                              answer: "B",
                              explanation: "The empty set is a subset of every set."
                            },
                            {
                              question: "If A = {1, 2, 3} and B = {3, 4, 5}, what is A ∩ B?",
                              options: { A: "{1, 2}", B: "{3}", C: "{4, 5}", D: "{1, 2, 3, 4, 5}" },
                              answer: "B",
                              explanation: "A ∩ B is the intersection, which is {3}."
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  })
}

main()
  .then(() => {
    console.log('Seed completed')
    return prisma.$disconnect()
  })
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })