import Jasmine from 'jasmine'
import JasmineConsoleReporter from 'jasmine-console-reporter';

const reporter = new JasmineConsoleReporter({
    colors: 2,           // (0|false)|(1|true)|2
    cleanStack: 1,       // (0|false)|(1|true)|2|3
    verbosity: 4,        // (0|false)|1|2|(3|true)|4
});

const jasmine = new Jasmine();
jasmine.addReporter(reporter);
jasmine.loadConfigFile('spec/support/jasmine.json');
jasmine.execute();
