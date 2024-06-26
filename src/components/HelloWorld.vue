<template>
  <v-container>
    <v-row class="text-center" justify="center">
      <v-col cols="12">
        <v-img
          :src="require('../assets/Team_Logo.png')"
          class="my-3"
          contain
          max-height="130"
        />
      </v-col>

      <v-col class="mb-4" xl="8">
        <h1>Welcome to Our CI/CD Pipeline Results</h1>

        <br />
        <p>
          Thank you for visiting our website! Here, you can explore the results
          of our CI/CD pipelines, which help ensure the quality and efficiency
          of our software development process.
        </p>
        <br />
        <h2>About Our Vulnerability Dashboard</h2>
        <br />
        <p>
          Our Vulnerability Dashboard provides an overview of the continuous
          integration and continuous deployment (CI/CD) pipelines used in our
          software development lifecycle. It showcases the latest build and
          deployment information, test results, and other relevant metrics to
          keep you informed about our project's progress.
        </p>
      </v-col>
    </v-row>
    <v-row justify="center" class="text-left">
      <v-col cols="12" align="center"> <h2>Meet Our Team</h2></v-col>
      <v-col cols="12" sm="12" md="12" lg="12" xl="8">
        <v-row justify="center">
          <v-col
            v-for="member in teamMembers"
            :key="member.name"
            cols="12"
            sm="6"
            md="4"
            lg="4"
            xl="4"
          >
            <v-card height="100%">
              <v-card-title>{{ member.name }}</v-card-title>
              <v-card-subtitle>{{ member.role }}</v-card-subtitle>

              <v-row justify="center">
                <v-col cols="auto">
                  <v-avatar size="150">
                    <img :src="member.avatar" alt="Avatar" />
                  </v-avatar>
                </v-col>
              </v-row>

              <v-card-text class="text-center">
                {{ member.description }}
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "HelloWorld",

  data() {
    return {
      teamMembers: [
        {
          name: "Julian Thiele",
          role: "Build Manager",
          description:
            "Julian is our skilled Build specialist, overseeing efficient build processes and deployment pipelines. With a focus on optimizing the delivery of our applications, Julian ensures that our build infrastructure is reliable, our workflows are streamlined, and our software is deployed with speed and precision.",
          avatar: "https://avatars.githubusercontent.com/u/41455100?v=4"
        },
        {
          name: "Michel Franz",
          role: "Security Expert",
          description:
            "Michel  is our dedicated security expert, safeguarding our systems and data with meticulous attention to detail. With a comprehensive understanding of cybersecurity best practices, Michel implements robust security measures, conducts risk assessments, and ensures that our organization remains protected against potential threats.",
          avatar: "https://avatars.githubusercontent.com/u/95618311?v=4"
        },
        {
          name: "Juri Kaemper",
          role: "Developer",
          description:
            "Juri is a talented developer who contributes to the creation of innovative and high-quality software solutions. With a keen eye for detail and a passion for clean code, Juri collaborates with the team to design and implement cutting-edge solutions that meet our clients needs and exceed their expectations.",
          avatar: "https://avatars.githubusercontent.com/u/94537452?v=4"
        },
        {
          name: "Felix Möhler",
          role: "Product Owner",
          description:
            "Felix is our Product Owner, driving the vision and prioritization of product features to deliver customer-centric solutions. With a deep understanding of market trends and customer needs, Felix ensures that our products meet the highest standards of quality and value.",
          avatar: "https://avatars.githubusercontent.com/u/104578023?v=4"
        },
        {
          name: "Christian Pacheco Lopéz",
          role: "Scrum Master",
          description:
            "Christian excels as our Scrum Master, fostering collaboration and optimizing project execution. With a strong grasp of Agile methodologies, Christian empowers the team to deliver high-quality results by facilitating effective communication, removing obstacles, and ensuring the smooth implementation of Scrum practices.",
          avatar: "https://avatars.githubusercontent.com/u/104578120?s=400&v=4"
        }
        // Add more team members as needed
      ]
    };
  }
};
</script>
