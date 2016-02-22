package lang.javascript;

import java.io.IOException;
import java.io.Reader;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.rascalmpl.interpreter.utils.RuntimeExceptionFactory;
import org.rascalmpl.uri.URIResolverRegistry;
import org.rascalmpl.value.ISourceLocation;
import org.rascalmpl.value.IString;
import org.rascalmpl.value.IValueFactory;

public class EvalJS {
	private final IValueFactory values;

	private final ScriptEngineManager mgr;
	private final ScriptEngine engine;
	
	public EvalJS(IValueFactory values) {
		super();
		this.values = values;
		this.mgr = new ScriptEngineManager();
		this.engine = mgr.getEngineByName("nashorn");
 	}

	public IString evalJS(ISourceLocation script, IString command) {
		try (Reader reader = URIResolverRegistry.getInstance().getCharacterReader(script)) {
			engine.eval(reader);
			Object result = engine.eval(command.getValue());
			return values.string(result.toString());
		} catch (ScriptException e) {
			throw RuntimeExceptionFactory.io(values.string(e.getMessage()), null, null);
		} catch (IOException e) {
			throw RuntimeExceptionFactory.io(values.string(e.getMessage()), null, null);
		}
	}
	
}